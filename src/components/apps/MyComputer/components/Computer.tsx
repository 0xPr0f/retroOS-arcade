import React, { useEffect, useRef, useState } from 'react'
import {
  Download,
  Image,
  Video,
  File,
  Search,
  Grid,
  List,
  Music,
  Laptop,
  LayoutGrid,
  Folder,
  Play,
  Pause,
  X,
  Eye,
  FileText,
} from 'lucide-react'
import { useDispatchWindows } from '@/components/pc/drives'
import { useMouse } from 'react-use'
interface FileItem {
  id: number
  name: string
  type: string
  category: string
  url: string
  size: string
  date: string
}

const renderFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'image':
      return <Image className="w-6 h-6 text-blue-500" />
    case 'video':
      return <Video className="w-6 h-6 text-red-500" />
    case 'audio':
      return <Music className="w-6 h-6 text-purple-500" />
    default:
      return <File className="w-6 h-6 text-gray-500" />
  }
}
const computerPopUpPlay = (
  filePreview: FileItem,
  createDispatchWindow: (options: any) => string,
  closeDispatchWindow: (id: string) => void,
  centeredX: number,
  centeredY: number
) => {
  //const { createDispatchWindow, closeDispatchWindow } = useDispatchWindows()
  if (!filePreview) return null

  let initialSize = { width: 450, height: 400 }

  switch (filePreview.type) {
    case 'image':
      initialSize = { width: 450, height: 400 }
      break
    case 'video':
      initialSize = { width: 450, height: 380 }
      break
    case 'audio':
      initialSize = { width: 300, height: 400 }
      break
    default:
      initialSize = { width: 450, height: 400 }
  }

  const windowId = createDispatchWindow({
    title: 'Preview',
    content: () => (
      <div>
        <PreviewContent
          filePreview={filePreview}
          closeDispatchWindow={() => closeDispatchWindow(windowId)}
        />
      </div>
    ),
    onClose: () => {
      closeDispatchWindow(windowId)
    },
    initialPosition: {
      x: centeredX,
      y: centeredY,
    },
    initialSize,
  })

  return windowId
}

const handleDownload = (file: FileItem) => {
  console.log(`Downloading: ${file.name}`)
  const link = document.createElement('a')
  link.href = file.url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const PreviewContent = ({
  filePreview,
  closeDispatchWindow,
}: {
  filePreview: FileItem
  closeDispatchWindow: any
}) => {
  const [isPlaying, setIsPlaying] = useState(false)

  const toggleAudioPlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const closePreview = () => {
    closeDispatchWindow() // Call the function passed from parent
  }

  const renderFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="w-6 h-6 text-blue-500" />
      case 'video':
        return <Video className="w-6 h-6 text-red-500" />
      case 'audio':
        return <Music className="w-6 h-6 text-purple-500" />
      default:
        return <File className="w-6 h-6 text-gray-500" />
    }
  }

  const renderPreviewContent = (file: FileItem) => {
    switch (file.type) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full">
            <img
              src={file.url}
              alt={file.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )
      case 'video':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-3xl">
              <video
                src={file.url}
                key={file.url}
                controls
                muted={false}
                className="w-full"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
              <Music className="w-12 h-12 text-purple-500" />
            </div>
            <div className="text-lg font-medium text-gray-800">{file.name}</div>
            <audio src={file.url} id="audio-player" className="hidden" />
            <div className="flex items-center space-x-2">
              <button
                className="w-16 h-16 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white"
                onClick={toggleAudioPlayback}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
              </button>
              {isPlaying && (
                <div className="text-sm text-gray-600">Now playing...</div>
              )}
            </div>
          </div>
        )
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-12 h-12 text-gray-500" />
            </div>
            <div className="text-lg font-medium text-gray-800">{file.name}</div>
            <p className="text-gray-500 text-center max-w-md">
              Preview not available for this file type.
              <br />
              Please download the file to view its contents.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen flex flex-col">
      {/* Modal Header */}
      <div className="px-6 py-2 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          {renderFileIcon(filePreview.type)}
          <span className="ml-2">{filePreview.name}</span>
        </h3>
        <div className="flex items-center space-x-4">
          <button
            className="p-2 text-blue-600 hover:text-blue-800"
            onClick={() => handleDownload(filePreview)}
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-gray-600"
            onClick={closePreview}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-3">
        {renderPreviewContent(filePreview)}
      </div>

      <div className="px-6 py-3 border-t border-gray-200 text-right">
        <div className="text-sm text-gray-500">
          {filePreview.size} • {filePreview.date}
        </div>
      </div>
    </div>
  )
}

const FileExplorer = () => {
  const [files, setFiles] = useState<FileItem[]>([
    // Add more desktop files here if needed
    {
      id: 1,
      name: 'Ai Oshi No Ko.jpeg',
      type: 'image',
      category: 'background',
      url: '/assets/images/ai.jpg',
      size: '67 KB',
      date: '2025-02-25',
    },
    {
      id: 2,
      name: 'Calm BackGround.jpeg',
      type: 'image',
      category: 'background',
      url: '/assets/images/bgimage.jpg',
      size: '257 KB',
      date: '2025-02-25',
    },

    // Background Assets
    // Add more background assets here if needed
    {
      id: 5,
      name: 'Chill Background Video.mp4',
      type: 'video',
      category: 'background',
      url: '/assets/videos/chillbgvid.mp4',
      size: '3.1 MB',
      date: '2025-02-25',
    },
    {
      id: 7,
      name: 'Horizon Background Video.mp4',
      type: 'video',
      category: 'background',
      url: '/assets/videos/horizonview.mp4',
      size: '1.1 MB',
      date: '2025-02-25',
    },
    // Music/Sound Assets
    // Add more music/sound assets here if needed
    {
      id: 9,
      name: 'No More Continues.mp3',
      type: 'audio',
      category: 'music',
      url: '/assets/audio/meloyaryesgriffiths.mp3',
      size: '8.9 MB',
      date: '2025-02-25',
    },
    {
      id: 10,
      name: 'Hiphop Rap Beat.mp3',
      type: 'audio',
      category: 'music',
      url: '/assets/audio/genxbeats.mp3',
      size: '6.8 MB',
      date: '2025-02-25',
    },
    {
      id: 11,
      name: 'Bass and Strings.mp3',
      type: 'audio',
      category: 'music',
      url: '/assets/audio/cyberwave-orchestra.mp3',
      size: '4 MB',
      date: '2025-02-25',
    },
    {
      id: 12,
      name: 'WatR - Double Overhead.mp3',
      type: 'audio',
      category: 'music',
      url: '/assets/audio/itswatr.mp3',
      size: '6.7 MB',
      date: '2025-02-25',
    },
    {
      id: 13,
      name: 'Lofi Cozy Chill.mp3',
      type: 'audio',
      category: 'music',
      url: '/assets/audio/lofi-chill.mp3',
      size: '4.7 MB',
      date: '2025-02-25',
    },
    {
      id: 14,
      name: 'Lofi Cozy Relax.mp3',
      type: 'audio',
      category: 'music',
      url: '/assets/audio/lofi-relax.mp3',
      size: '4.7 MB',
      date: '2025-02-25',
    },

    // Video Assets
    // Add more video assets here if needed
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedFiles, setSelectedFiles] = useState<number[]>([])
  const [activeCategory, setActiveCategory] = useState('all') // 'all', 'desktop', 'background', 'music', 'video'
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [windowId, setWindowId] = useState<string | null>(null)

  const { closeDispatchWindow, createDispatchWindow } = useDispatchWindows()

  interface Category {
    id: string
    name: string
    icon: React.ReactNode
  }

  const categories: Category[] = [
    { id: 'all', name: 'All Files', icon: <Folder className="w-5 h-5" /> },
    {
      id: 'desktop',
      name: 'Desktop Files',
      icon: <Laptop className="w-5 h-5" />,
    },
    {
      id: 'background',
      name: 'Background Assets',
      icon: <LayoutGrid className="w-5 h-5" />,
    },
    {
      id: 'music',
      name: 'Music/Sound Assets',
      icon: <Music className="w-5 h-5" />,
    },
    { id: 'video', name: 'Video Assets', icon: <Video className="w-5 h-5" /> },
  ]

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesCategory =
      activeCategory === 'all' || file.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const toggleFileSelection = (fileId: number) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter((id) => id !== fileId))
    } else {
      setSelectedFiles([...selectedFiles, fileId])
    }
  }

  const handleBulkDownload = () => {
    const filesToDownload = files.filter((file) =>
      selectedFiles.includes(file.id)
    )
    console.log(
      'Downloading selected files:',
      filesToDownload.map((f) => f.name).join(', ')
    )
    filesToDownload.map((file) => {
      handleDownload(file)
    })
  }

  const dispatchWindowSize = (file: FileItem) => {
    if (!file) return { width: 450, height: 400 }
    switch (file.type) {
      case 'image':
        return { width: 450, height: 400 }
      case 'video':
        return { width: 450, height: 380 }
      case 'audio':
        return { width: 300, height: 400 }
      default:
        return { width: 450, height: 400 }
    }
  }

  const handlePreview = (file: FileItem) => {
    setPreviewFile(file)
    if (file.type === 'audio') {
      setIsPlaying(false)
    }
    calculateTriggerPreview(file)
  }
  const containerRef = useRef<HTMLDivElement>(null)

  const mouse = useMouse(containerRef as React.RefObject<Element>)

  const calculateTriggerPreview = (file: FileItem) => {
    const { width, height } = dispatchWindowSize(file)
    const centeredX = mouse.docX - width / 2
    const centeredY = mouse.docY - height / 2
    if (windowId) {
      closeDispatchWindow(windowId)
    }
    if (file) {
      const dispatchWindowId = computerPopUpPlay(
        file!,
        createDispatchWindow,
        closeDispatchWindow,
        centeredX,
        centeredY
      )
      setWindowId(dispatchWindowId)
    }
  }

  const isPreviewable = (fileType: string) => {
    return ['image', 'video', 'audio'].includes(fileType)
  }

  return (
    <div
      ref={containerRef}
      className="min-h-full h-fit bg-white rounded-lg shadow-md p-6 max-w-6xl mx-auto"
    >
      <div className="mb-5">
        <div className="mb-6 border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
            {categories
              .filter((category) =>
                files.some((file) => file.category === category.id)
              )
              .map((category) => (
                <li className="mr-2" key={category.id}>
                  <button
                    className={`inline-flex items-center px-4 py-2 border-b-2 rounded-t-lg ${
                      activeCategory === category.id
                        ? 'text-blue-600 border-blue-600 active'
                        : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                </li>
              ))}
          </ul>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex border border-gray-300 rounded-md">
              <button
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600'
                }`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600'
                }`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {selectedFiles.length > 0 && (
              <button
                className=" whitespace-nowrap flex items-center space-x-1 px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleBulkDownload}
              >
                <Download className="w-4 h-4" />
                <span>Download {selectedFiles.length}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`relative group border rounded-lg overflow-hidden hover:shadow-lg transition-all ${
                selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => toggleFileSelection(file.id)}
            >
              <div className="aspect-square bg-gray-100 relative">
                {file.type === 'image' ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {renderFileIcon(file.type)}
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  {renderFileIcon(file.type)}
                </div>
                {selectedFiles.includes(file.id) && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                )}
              </div>

              <div className="p-2">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">{file.size}</p>
              </div>

              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <div className="flex space-x-2">
                  {isPreviewable(file.type) && (
                    <button
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePreview(file)
                      }}
                    >
                      <Eye className="w-5 h-5 text-gray-800" />
                    </button>
                  )}
                  <button
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(file)
                    }}
                  >
                    <Download className="w-5 h-5 text-gray-800" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Size
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <tr
                  key={file.id}
                  className={`hover:bg-gray-50 ${
                    selectedFiles.includes(file.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleFileSelection(file.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 mr-2 flex items-center justify-center">
                        {renderFileIcon(file.type)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {file.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 capitalize">
                      {file.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{file.size}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{file.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {isPreviewable(file.type) && (
                        <button
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreview(file)
                          }}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        className="text-blue-600 hover:text-blue-900 p-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(file)
                        }}
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <File className="w-full h-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No files found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  )
}

export default FileExplorer
