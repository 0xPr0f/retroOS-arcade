import { useQueryState } from 'nuqs'
import { useLocalStorage } from 'react-use'
import { useState } from 'react'

const useExperimentalFeatures = () => {
  const [experimentalFlag, setExperimentalFlag] = useLocalStorage(
    'retro_experimental_flag',
    JSON.stringify(false)
  )

  const isExperimentalFlag = () => {
    return experimentalFlag === 'true'
  }

  const setStorageExperimentalFlag = () => {
    return setExperimentalFlag(JSON.stringify(!isExperimentalFlag()))
  }

  const useSaveState = (key?: string, parser?: any, defaultValue?: any) => {
    if (isExperimentalFlag()) {
      return useQueryState(key!, parser)
    }
    return useState(defaultValue ?? null)
  }

  return {
    isExperimentalFlag,
    useSaveState,
    setStorageExperimentalFlag,
  }
}

export default useExperimentalFeatures

////// Example Usage //////////
/*
  const useSaveState = (key?: string, parser?: any, defaultValue?: any) => {
    if (getExperimentalFlag()) {
      return useQueryState(key!, parser)
    }
    return useState(defaultValue ?? null)
  }
  const validateWindows = (value: unknown): Window[] => {
    if (!Array.isArray(value)) {
      return []
    }
    // Add any additional validation logic here if needed
    return value as Window[]
  }
  const windowsParser = parseAsJson<Window[]>(validateWindows)
    .withDefault([])
    .withOptions({
      history: 'replace',
    })
  const [windows, setWindows] = useSaveState('windows', windowsParser)
*/
