'use client'

import { useState, useRef, useEffect } from 'react'
import { FiSearch, FiFile, FiTrash2, FiExternalLink } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useToast } from "@/components/ui/use-toast"
import MainLayout from '@/components/layout/MainLayout'

type Document = {
  id: string
  name: string
  type: string
  size: number
  lastModified: Date
  url: string
  status?: 'pending' | 'processing' | 'completed' | 'error'
  processingProgress?: number
}

export default function LibraryPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch user's documents on mount
  useEffect(() => {
    if (session?.user) {
      const loadDocuments = async () => {
        try {
          const response = await fetch('/api/documents')
          const data = await response.json()
          
          setDocuments(data.documents)
          
          // Start polling only for documents that need it
          const cleanupFunctions = data.documents
            .filter((doc: Document) => doc.status === 'processing' || doc.status === 'pending')
            .map((doc: Document) => pollProcessingStatus(doc.id, doc.url))
          
          // Cleanup polling on unmount
          return () => {
            cleanupFunctions.forEach((cleanup: () => void) => cleanup())
          }
        } catch (error) {
          console.error('Error fetching documents:', error)
          toast({
            title: "Error",
            description: "Failed to fetch documents",
            variant: "destructive",
          })
        }
      }

      loadDocuments()
    }
  }, [session])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      const data = await response.json()
      setDocuments(data.documents)
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }) => {
    const files = event.target.files
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type !== 'application/pdf') {
          toast({
            title: "Error",
            description: "Only PDF files are allowed",
            variant: "destructive",
          })
          continue
        }

        const formData = new FormData()
        formData.append('file', file)

        try {
          // Upload file and create document record
          const uploadResponse = await fetch('/api/documents/upload', {
            method: 'POST',
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error('Upload failed')
          }

          const uploadData = await uploadResponse.json()
          console.log('File uploaded:', uploadData)

          // Add document to state with pending status
          const newDocument: Document = {
            id: uploadData.fileAsset._id,
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: new Date(file.lastModified),
            url: uploadData.fileAsset.filePath,
            status: 'pending',
            processingProgress: 0
          }

          setDocuments(prev => [...prev, newDocument])

          // Immediately start processing
          const processResponse = await fetch('/api/process-document', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              documentId: uploadData.fileAsset.filePath,
              startProcessing: true
            }),
          })

          if (!processResponse.ok) {
            throw new Error('Failed to start document processing')
          }

          // Start polling for processing status
          pollProcessingStatus(newDocument.id, uploadData.fileAsset.filePath)

          toast({
            title: "Success",
            description: "Document uploaded and processing started",
          })
        } catch (error) {
          console.error('Error uploading file:', error)
          toast({
            title: "Error",
            description: "Failed to upload document",
            variant: "destructive",
          })
        }
      }
    }
  }

  const pollProcessingStatus = async (documentId: string, filePath: string) => {
    let pollingInterval: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 30; // Maximum number of polling attempts
    
    const checkStatus = async () => {
      try {
        // Use processing-status endpoint instead of process-document
        const response = await fetch(`/api/processing-status?documentId=${encodeURIComponent(filePath)}`);
        
        if (!response.ok) {
          console.error('Status check failed:', response.status);
          clearInterval(pollingInterval);
          return;
        }

        const data = await response.json();
        attempts++;

        setDocuments(prev => prev.map(doc => {
          if (doc.id === documentId) {
            return {
              ...doc,
              status: data.status,
              processingProgress: data.totalSections && data.processedSections 
                ? (data.processedSections / data.totalSections) * 100 
                : 0
            };
          }
          return doc;
        }));

        // Clear interval if processing is complete, errored, or max attempts reached
        if (data.status === 'completed' || data.status === 'error' || attempts >= maxAttempts) {
          console.log(`Stopping polling: ${data.status}, attempts: ${attempts}`);
          clearInterval(pollingInterval);
        }
      } catch (error) {
        console.error('Error checking processing status:', error);
        clearInterval(pollingInterval);
      }
    };

    // Initial check
    await checkStatus();
    
    // Only start polling if the status is still processing
    const initialStatus = documents.find(doc => doc.id === documentId)?.status;
    if (initialStatus === 'processing' || initialStatus === 'pending') {
      pollingInterval = setInterval(checkStatus, 5000); // Check every 5 seconds
    }

    // Cleanup function
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  };

  const handleDocumentSelect = (document: Document) => {
    router.push(`/reader?id=${document.id}&url=${encodeURIComponent(document.url)}`)
  }

  const handleDocumentDelete = (documentToDelete: Document) => {
    setDocuments(documents.filter(doc => doc.id !== documentToDelete.id))
    if (selectedDocument && selectedDocument.id === documentToDelete.id) {
      setSelectedDocument(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB'
    else return (bytes / 1073741824).toFixed(1) + ' GB'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf')
    if (files.length === 0) {
      console.error('Only PDF files are allowed')
      return
    }
    
    if (files && fileInputRef.current) {
      const dataTransfer = new DataTransfer()
      files.forEach(file => dataTransfer.items.add(file))
      fileInputRef.current.files = dataTransfer.files
      handleFileUpload({ target: { files: dataTransfer.files } } as any)
    }
  }

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Library</h1>
        </div>

        {/* Search bar */}
        <div className="mb-8">
          <div className="relative max-w-lg">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Upload area */}
        <div 
          className={`mb-8 relative ${isDragging ? 'border-indigo-500' : 'border-gray-300'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label 
            htmlFor="file-upload" 
            className={`flex flex-col items-center justify-center w-full h-48 px-4 transition bg-white dark:bg-gray-800 border-2 border-dashed rounded-lg appearance-none cursor-pointer hover:border-indigo-500 focus:outline-none ${
              isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            <FiFile className="w-10 h-10 text-gray-400 mb-3" />
            <div className="text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Drag and drop your PDF files here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or click to browse
              </p>
            </div>
            <input 
              id="file-upload" 
              name="file-upload" 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload} 
              multiple 
              accept=".pdf,application/pdf"
              ref={fileInputRef}
            />
          </label>
        </div>

        {/* Document grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div 
              key={doc.id}
              className="relative group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <FiFile className="w-8 h-8 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate" title={doc.name}>
                        {doc.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(doc.size)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleDocumentSelect(doc)}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <FiExternalLink className="w-4 h-4 mr-1" />
                    Open
                  </button>
                  <button
                    onClick={() => handleDocumentDelete(doc)}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <FiTrash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredDocuments.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FiFile className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No documents</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No documents match your search.' : 'Upload PDF documents to get started.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
