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

  const useSaveState = <T,>(
    key?: string,
    parser?: any,
    defaultValue?: T
  ): [T, React.Dispatch<React.SetStateAction<T>>] => {
    if (isExperimentalFlag()) {
      return useQueryState(key!, parser) as unknown as [
        T,
        React.Dispatch<React.SetStateAction<T>>
      ]
    }
    // If defaultValue is not provided and T is assumed to be string, fallback to an empty string.
    // Otherwise, you may throw an error or handle it as needed.
    const initialValue =
      defaultValue !== undefined ? defaultValue : ('' as unknown as T)
    return useState<T>(initialValue)
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
