import { useState, useEffect, useCallback } from 'react'
import { recommendationService } from '../services/recommendationService'
import CareerCard from '../components/CareerCard'
import { SkeletonList } from '../components/SkeletonLoader'
import { useToast } from '../hooks/useToast'
import { Link } from 'react-router-dom'
import { Search, Filter, Sparkles, History, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

export default function RecommendationHistory() {
  const { success, error: toastError } = useToast()

  const [records, setRecords]     = useState([])
  const [total, setTotal]         = useState(0)
  const [pages, setPages]         = useState(1)
  const [page, setPage]           = useState(1)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const LIMIT = 9

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await recommendationService.getHistory({ page, limit: LIMIT, search })
      if (res.success) {
        setRecords(res.data.records)
        setTotal(res.data.total)
        setPages(res.data.pages)
      }
    } catch {
      toastError('Failed to load history.')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { load() }, [load])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleDelete = async (id) => {
    try {
      const res = await recommendationService.deleteRecommendation(id)
      if (res.success) {
        success('Recommendation deleted.')
        setDeleteConfirm(null)
        load()
      }
    } catch {
      toastError('Delete failed.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <History className="w-7 h-7 text-brand-400" /> Recommendation History
          </h1>
          <p className="text-gray-400 mt-1">{total} career analyses on record</p>
        </div>
        <Link to="/career-form" id="history-new-analysis" className="btn-primary">
          <Sparkles className="w-4 h-4" /> New Analysis
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            id="history-search"
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by goal, industry, name..."
            className="input pl-10"
          />
        </div>
        <button id="history-search-submit" type="submit" className="btn-primary px-5">
          <Filter className="w-4 h-4" /> Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
            className="btn-secondary px-4"
          >
            Clear
          </button>
        )}
      </form>

      {/* Results */}
      {loading ? (
        <SkeletonList count={6} />
      ) : records.length === 0 ? (
        <div className="glass p-16 text-center">
          <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-400 mb-2">
            {search ? 'No results found' : 'No history yet'}
          </h2>
          <p className="text-gray-500 mb-6">
            {search ? `Try a different search term.` : 'Start your first career analysis to see it here.'}
          </p>
          {!search && (
            <Link to="/career-form" className="btn-primary">
              <Sparkles className="w-4 h-4" /> Start Analysis
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {records.map(rec => (
            <CareerCard
              key={rec.id}
              rec={rec}
              onDelete={(id) => setDeleteConfirm(id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            id="history-prev-page"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary py-2 px-4 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  id={`history-page-${p}`}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    p === page ? 'bg-gradient-to-r from-brand-600 to-accent-600 text-white' : 'btn-secondary py-2 px-2'
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>

          <button
            id="history-next-page"
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="btn-secondary py-2 px-4 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass p-8 max-w-sm w-full mx-4 text-center">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Delete Recommendation?</h3>
            <p className="text-gray-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                id="confirm-delete-btn"
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 btn-danger py-3"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
