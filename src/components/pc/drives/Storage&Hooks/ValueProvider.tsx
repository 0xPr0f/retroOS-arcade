import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ValueContextType {
  values: Record<string, any>
  setValue: (key: string, value: any) => void
  getValue: (key: string) => any
  removeValue: (key: string) => void
  clearAll: () => void
}

const ValueContext = createContext<ValueContextType | undefined>(undefined)

interface ValueProviderProps {
  children: ReactNode
  initialValues?: Record<string, any>
}

export const ValueProvider: React.FC<ValueProviderProps> = ({
  children,
  initialValues = {},
}) => {
  const [values, setValues] = useState<Record<string, any>>(initialValues)

  const setValue = (key: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const getValue = (key: string) => {
    return values[key]
  }

  const removeValue = (key: string) => {
    setValues((prev) => {
      const newValues = { ...prev }
      delete newValues[key]
      return newValues
    })
  }

  const clearAll = () => {
    setValues({})
  }

  const value = {
    values,
    setValue,
    getValue,
    removeValue,
    clearAll,
  }

  return <ValueContext.Provider value={value}>{children}</ValueContext.Provider>
}

export const useValue = () => {
  const context = useContext(ValueContext)
  if (context === undefined) {
    throw new Error('useValue must be used within a ValueProvider')
  }
  return context
}

export function useTypedValue<T>(
  key: string
): [T | undefined, (value: T) => void] {
  const { getValue, setValue } = useValue()
  const value = getValue(key) as T
  const setTypedValue = (newValue: T) => setValue(key, newValue)
  return [value, setTypedValue]
}
