import React from 'react'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  totalResults: number
  currentPage: number
  resultsPerPage: number
  onPageChange: (pageNumber: number) => void
}
/*Not currently in use */
const Pagination: React.FC<PaginationProps> = ({
  totalResults,
  currentPage,
  resultsPerPage,
  onPageChange,
}) => {
  // Calculate total pages
  const totalPages = Math.ceil(totalResults / resultsPerPage)

  // Generate page numbers to display
  const generatePageNumbers = () => {
    const pages: number[] = []

    // Always show first page
    if (currentPage > 3) {
      pages.push(1)
      if (currentPage > 4) pages.push(-1) // Ellipsis
    }

    // Show pages around current page
    const startPage = Math.max(1, currentPage - 1)
    const endPage = Math.min(totalPages, currentPage + 1)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Always show last page if we're not already close to it
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) pages.push(-1) // Ellipsis
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = generatePageNumbers()

  return (
    <div className="flex border border-green-500 items-center justify-center space-x-2 my-4">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) =>
        page === -1 ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded-md border ${
              currentPage === page
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}

const SearchResultsPage: React.FC<{ searchData: any }> = ({ searchData }) => {
  const results = searchData?.items || []
  return (
    <div className="container mx-auto p-4">
      <div className="text-sm text-gray-600 mb-4">
        About {searchData?.searchInformation?.totalResults || 0} results (in{' '}
        {searchData?.searchInformation?.searchTime?.toFixed(2) || 0} seconds)
      </div>
      {results.map((item: any, index: number) => (
        <div key={index} className=" flex flex-row mb-3 border-b">
          <div className="p-2 border">
            <Link
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              <span className="inline-flex items-center">
                <span
                  dangerouslySetInnerHTML={{
                    __html: item.htmlTitle,
                  }}
                  className=""
                />
              </span>
              <div>
                <ExternalLink size={16} className="ml-2" />
              </div>
            </Link>

            <div className="text-green-700 text-sm mb-1">
              {item.displayLink}
            </div>

            <p
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: item.htmlSnippet }}
            />
          </div>
          {/* Will not use NextJS (Image tag) for the images as it need configuration which isnt know before hand */}
          {item.pagemap?.cse_image?.[0]?.src && (
            <img
              src={item.pagemap.cse_image[0].src}
              onError={(e) => {
                ;(e.target as HTMLImageElement).hidden = true
              }}
              alt="Loading thumbnail..."
              width={200}
              height={150}
              className=" object-fill max-w-xs max-h-48 mt-2 rounded"
              loading="lazy"
            />
          )}
        </div>
      ))}
    </div>
  )
}
export { Pagination }
export default SearchResultsPage
