"""
Custom typed exceptions for the Career Guidance Agent backend.
"""


class AppException(Exception):
    """Base application exception."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class DatabaseException(AppException):
    def __init__(self, message: str = "Database error occurred."):
        super().__init__(message, 503)


class AIServiceException(AppException):
    def __init__(self, message: str = "AI service error occurred."):
        super().__init__(message, 502)


class AuthenticationException(AppException):
    def __init__(self, message: str = "Authentication failed."):
        super().__init__(message, 401)


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found."):
        super().__init__(message, 404)


class ConflictException(AppException):
    def __init__(self, message: str = "Resource already exists."):
        super().__init__(message, 409)


class ValidationException(AppException):
    def __init__(self, message: str = "Validation error."):
        super().__init__(message, 422)


class RateLimitException(AppException):
    def __init__(self, message: str = "Too many requests. Please try again later."):
        super().__init__(message, 429)
