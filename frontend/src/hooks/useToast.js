import toast from 'react-hot-toast'

/**
 * Convenience hook wrapping react-hot-toast with styled presets.
 */
export function useToast() {
  const success = (message) => toast.success(message)
  const error   = (message) => toast.error(message)
  const loading = (message) => toast.loading(message)
  const dismiss = (id)      => toast.dismiss(id)

  const promise = (promiseFn, messages) =>
    toast.promise(promiseFn, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Done!',
      error:   messages.error   || 'Something went wrong.',
    })

  return { success, error, loading, dismiss, promise }
}
