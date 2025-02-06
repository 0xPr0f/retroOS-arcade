import React, { useState, useCallback, useEffect } from 'react'
import { Search, Globe, Zap, X } from 'lucide-react'
import SearchResultsPage from './ResultDisplay'
import { CustomSearchResult, testData } from './types'

const InternetBrowser: React.FC = () => {
  const [results, setResults] = useState<CustomSearchResult | undefined>(
    undefined
  )
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'google' | 'ai'>('google')
  const [searchQuery, setSearchQuery] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [error, setError] = useState<string | undefined>(undefined)

  const performSearch = async () => {
    if (!searchQuery.trim()) return
    if (mode === 'ai') return
    setLoading(true)
    try {
      const response = await fetch(
        `/api/search?q=${searchQuery}&start=${pageNumber}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Search request failed')
      }

      const result = await response.json()
      setLoading(false)
      setResults(result)
    } catch (error) {
      setError((error as any).message)
      setResults(undefined)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery) {
      performSearch()
    }
  }, [pageNumber])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') performSearch()
    },
    [performSearch]
  )

  const DefaultContent = () => (
    <div className="flex items-center justify-center h-full text-gray-500">
      <p>Start searching the web by entering a query</p>
    </div>
  )
  const NoAIContent = () => (
    <div className="flex items-center justify-center h-full text-gray-500">
      <p>AI content is not yet available</p>
    </div>
  )

  return (
    <div className="flex flex-col h-[580px] border rounded-lg">
      <div className="flex items-center p-2 bg-gray-100 border-b">
        <div className="flex-grow mx-2 relative">
          <input
            id="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
            }}
            onKeyPress={handleKeyPress}
            placeholder="Search the web"
            className="w-full p-2 rounded-full border"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Search Mode Toggle */}
        <button
          onClick={() => {
            setMode(mode === 'google' ? 'ai' : 'google')
          }}
          className="icon-button"
        >
          {mode === 'google' ? <Globe /> : <Zap />}
        </button>

        {/* Search Button */}
        <button
          onClick={performSearch}
          disabled={loading}
          className="icon-button ml-2"
        >
          <Search />
        </button>
      </div>

      {/* Results Area */}
      <div className="flex-grow overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            {results === undefined ? (
              <>{mode !== 'ai' && <DefaultContent />}</>
            ) : (
              <>{mode !== 'ai' && <SearchResultsPage searchData={results} />}</>
            )}
            <>{mode === 'ai' ? <NoAIContent /> : null}</>
          </>
        )}
      </div>
    </div>
  )
}

export default InternetBrowser
