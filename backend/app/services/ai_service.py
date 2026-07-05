"""
AI Service — modular wrapper around Groq API.
"""
import os
import json
import logging
import re
from typing import Any
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from openai import AsyncOpenAI, APIError, RateLimitError
from dotenv import load_dotenv
from app.utils.exceptions import AIServiceException

load_dotenv()

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY is not set. AI features will not work.")
    client = None
else:
    client = AsyncOpenAI(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )


def _build_career_prompt(payload: dict) -> str:
    """Construct the structured career guidance prompt for Groq."""
    return f"""You are an expert career counselor and data scientist with deep knowledge of global job markets.

Analyze the following candidate profile and generate EXACTLY 3 personalized career path recommendations.

## Candidate Profile:
- Name: {payload.get("name")}
- Education: {payload.get("education")}
- College: {payload.get("college")}
- CGPA: {payload.get("cgpa")}
- Years of Experience: {payload.get("years_of_experience")}
- Skills: {", ".join(payload.get("skills", []))}
- Interests: {", ".join(payload.get("interests", []))}
- Career Goal: {payload.get("career_goal")}
- Preferred Industry: {payload.get("preferred_industry")}
- Preferred Location: {payload.get("preferred_location")}
- Expected Salary: {payload.get("expected_salary")}

## CRITICAL INSTRUCTIONS:
1. Respond with ONLY a valid JSON object — no markdown, no code fences, no explanations, no text before or after the JSON.
2. The JSON must have exactly one key: "careers" — an array of exactly 3 objects.
3. Each object must contain ALL of these keys with appropriate values:
4. Keep every string field concise: "reason" max 2 sentences, "futureScope" max 2 sentences, "riskAnalysis" max 1-2 sentences, "summary" max 2-3 sentences. Keep each array to 3-5 short items.

{{
  "careers": [
    {{
      "careerTitle": "string — specific job title",
      "matchPercentage": integer between 0 and 100,
      "reason": "string — 2-3 sentences explaining why this matches the candidate",
      "salaryRange": "string — e.g. '$80,000 - $120,000 per year'",
      "requiredSkills": ["array", "of", "skill", "strings"],
      "missingSkills": ["array", "of", "skill", "strings", "candidate", "lacks"],
      "learningRoadmap": ["ordered", "list", "of", "learning", "steps"],
      "recommendedCertifications": ["array", "of", "certification", "names"],
      "usefulProjects": ["array", "of", "project", "ideas"],
      "companiesHiring": ["array", "of", "company", "names"],
      "interviewPreparationTips": ["array", "of", "tip", "strings"],
      "futureScope": "string — 2-3 sentences about future growth",
      "riskAnalysis": "string — 2 sentences about risks in this career path",
      "summary": "string — 3-4 sentence overall career summary"
    }}
  ]
}}

Return ONLY the JSON object. No other text."""


def _extract_json(text: str) -> dict:
    """
    Robustly extract and parse a JSON object from the model's response text.
    Handles markdown code fences and attempts to repair truncated JSON.
    """
    text = text.strip()

    # Strip common markdown code fence patterns
    patterns = [
        r"```json\s*([\s\S]*?)\s*```",
        r"```\s*([\s\S]*?)\s*```",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.DOTALL)
        if match:
            text = match.group(1).strip()
            break

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        repaired = _attempt_json_repair(text)
        if repaired is not None:
            logger.warning("Repaired truncated JSON response from AI (salvaged partial careers list).")
            return repaired
        raise AIServiceException(f"AI returned invalid JSON: {e}. Raw response: {text[:500]}")


def _attempt_json_repair(text: str) -> dict | None:
    """
    Attempt to salvage a truncated JSON response by trimming back to the
    last fully-closed career object inside the "careers" array.
    Returns a valid dict on success, or None if repair isn't possible.
    """
    careers_start = text.find('"careers"')
    if careers_start == -1:
        return None

    array_start = text.find('[', careers_start)
    if array_start == -1:
        return None

    # Walk the string tracking brace depth to find complete objects only
    depth = 0
    in_string = False
    escape = False
    last_complete_end = None
    obj_start = None

    for i in range(array_start, len(text)):
        ch = text[i]
        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_string = False
            continue
        if ch == '"':
            in_string = True
        elif ch == '{':
            if depth == 0:
                obj_start = i
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0 and obj_start is not None:
                last_complete_end = i

    if last_complete_end is None:
        return None

    salvaged = text[array_start:last_complete_end + 1] + "]}"
    candidate = '{"careers": ' + salvaged
    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        return None


@retry(
    retry=retry_if_exception_type((APIError, RateLimitError)),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    stop=stop_after_attempt(3),
)
async def _call_groq(prompt: str) -> str:
    """Internal function to call the Groq API via the OpenAI client with retry logic."""
    if not client:
        raise AIServiceException("GROQ_API_KEY is not configured.")

    try:
        response = await client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that only responds in raw JSON format."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=5000,  # kept under the 8000 TPM (prompt + completion) rate limit
            response_format={"type": "json_object"},  # forces valid JSON syntax where supported
        )
        choice = response.choices[0]
        content = choice.message.content
        if not content:
            raise AIServiceException("Groq returned an empty response.")

        if choice.finish_reason == "length":
            logger.warning(
                "Groq response was cut off due to max_tokens limit "
                "(finish_reason='length'). Attempting repair on parse."
            )

        return content
    except RateLimitError as e:
        logger.warning(f"Groq rate limit hit, retrying: {e}")
        raise
    except APIError as e:
        logger.error(f"Groq API error: {e}")
        raise AIServiceException(f"Groq API error: {e}")
    except Exception as e:
        logger.error(f"Unexpected AI service error: {e}")
        raise AIServiceException(f"Unexpected AI error: {e}")


async def generate_career_recommendations(payload: dict) -> dict[str, Any]:
    """
    Main entry point — generate structured career recommendations using Groq.
    Returns parsed JSON dict; raises AIServiceException on any failure.
    """
    if not GROQ_API_KEY:
        raise AIServiceException("GROQ_API_KEY is not configured.")

    prompt = _build_career_prompt(payload)
    logger.info(f"Calling Groq model: {GROQ_MODEL}")

    raw_text = await _call_groq(prompt)
    parsed = _extract_json(raw_text)

    # Validate structure
    if "careers" not in parsed or not isinstance(parsed["careers"], list):
        raise AIServiceException("AI response missing 'careers' array.")
    if len(parsed["careers"]) == 0:
        raise AIServiceException("AI returned empty careers array.")

    logger.info(f"Successfully generated {len(parsed['careers'])} career recommendations.")
    return parsed