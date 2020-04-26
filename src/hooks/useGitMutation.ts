import { useEffect, useMemo } from 'react'
import { useAsync } from 'react-async'
import git from '../lib/git'
import { GitMutation, GitOperationName } from '../lib/gitOperations'
import { GitStatus } from './useGitQuery'

export interface GitMutationResponse<R> {
  name: GitOperationName
  state?: R
  status: GitStatus
  error?: Error
  run: () => void
}

export default function useGitMutation<R, I>(
  mutation: GitMutation<I, R>,
  item?: I
): GitMutationResponse<R> {
  const { run, status, data, error, isInitial } = useAsync({
    deferFn: () => {
      if (item) {
        return mutation.run(
          git.outputHandler(() => undefined),
          item
        )
      } else {
        return Promise.reject()
      }
    },
  })

  useEffect(() => {
    if (item && isInitial) {
      run()
    }
  }, [item, run, isInitial])

  // useEffect(() => {
  //   if (error) {
  //     setError(error)
  //   }
  // }, [error, setError])

  const gitStatus = useMemo(() => {
    switch (status) {
      case 'initial':
        return GitStatus.initial
      case 'pending':
        return GitStatus.loading
      case 'fulfilled':
        return GitStatus.success
      default:
        return GitStatus.error
    }
  }, [status])

  return {
    name: mutation.getName(item),
    state: data,
    status: gitStatus,
    run: run,
    error,
  }
}
