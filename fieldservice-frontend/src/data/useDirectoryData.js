import { useContext } from 'react'
import { DirectoryDataContext } from './directoryDataContext.js'

export function useDirectoryData() {
  const context = useContext(DirectoryDataContext)

  if (!context) {
    throw new Error('useDirectoryData must be used inside DirectoryDataProvider')
  }

  return context
}
