'use client';

import React, { useState, useRef, useEffect, useCallback, ReactElement } from 'react';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { selectionModePlugin, SelectionMode } from '@react-pdf-viewer/selection-mode';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/selection-mode/lib/styles/index.css';
import '@react-pdf-viewer/toolbar/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FiPlay, FiPause, FiChevronLeft, FiChevronRight, FiSearch, FiZoomIn, FiZoomOut, FiUpload, FiMenu, FiActivity, FiX, FiBell, FiSun, FiMoon, FiHome, FiBook, FiFileText, FiMic, FiUsers, FiCalendar, FiLayers, FiBookOpen, FiLogOut, FiUser, FiSettings, FiRepeat } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import logoSrc from '../img/logo.png';
import PDFAIPanel from './ai-panel';
import '@/styles/PDFViewerStyles.css';

import { motion } from 'framer-motion';
import { DocumentLoadEvent } from '@react-pdf-viewer/core';
import { PDFDocumentProxy } from 'pdfjs-dist';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { debounce } from 'lodash';
import { version } from 'pdfjs-dist';
import { ThemeProvider } from 'next-themes'
import pdfjsLib from 'pdfjs-dist';

// Error Boundary Component to catch and display errors gracefully
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full">
          <h1 className="text-2xl text-red-500">Something went wrong while loading the PDF.</h1>
        </div>
      );
    }

    return this.props.children;
  }
}

interface Section {
  page: number;
  text: string;
  id: string;
}

interface SearchResult {
  content: string;
  page: number;
}

interface SidebarItemProps {
  icon: ReactElement;
  text: string;
  href: string;
  active?: boolean;
  isDark: boolean;
  isCollapsed: boolean;
}

const PDFViewerPage: React.FC = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <PDFViewerContent />
    </ThemeProvider>
  );
};

const PDFViewerContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [pdfUrl, setPdfUrl] = useState<string | null>(searchParams.get('url'));
  const [numPages, setNumPages] = useState<number>(0);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [readingSpeed, setReadingSpeed] = useState<number>(1);
  const [sections, setSections] = useState<Section[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(SelectionMode.Text);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [currentScale, setCurrentScale] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [goToPageInput, setGoToPageInput] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // Initially closed
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true); // Initially collapsed
  const [isAIPanelVisible, setIsAIPanelVisible] = useState(false);
  const [pdfText, setPdfText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [currentReadingText, setCurrentReadingText] = useState<string | null>(null);

  // Initialize plugins
  const selectionModePluginInstance = selectionModePlugin({ selectionMode });
  const toolbarPluginInstance = toolbarPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  // Initialize default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // Handle Errors Gracefully
  const handleError = useCallback((error: Error) => {
    console.error('PDF Viewer Error:', error);
  }, []);

  // Extract text content from each page for text-to-speech
  const extractSections = useCallback(async (doc: PDFDocumentProxy) => {
    const extractedSections: Section[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item: any) => item.str).join(' ');
      extractedSections.push({
        page: i,
        text: textItems,
        id: `section-${i}`,
      });
    }
    setSections(extractedSections);
    setFilteredSections(extractedSections);
    setPdfText(extractedSections.map(section => section.text).join(' '));
  }, [setSections, setFilteredSections]);

  // Handle Document Load Event
  const handleDocumentLoad = useCallback(async (e: DocumentLoadEvent) => {
    try {
      const doc = e.doc as unknown as PDFDocumentProxy;
      console.log('PDF document loaded:', doc);
      setNumPages(doc.numPages);
      
      // Extract text from all pages
      let fullText = '';
      const extractedSections: Section[] = [];
      
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
        
        extractedSections.push({
          page: i,
          text: pageText,
          id: `section-${i}`,
        });
      }

      // Set sections and text
      setSections(extractedSections);
      setFilteredSections(extractedSections);
      setPdfText(fullText);

      // Process document for RAG only if not already processed
      if (pdfUrl) {
        try {
          // First check if document is already processed
          const statusResponse = await fetch(`/api/processing-status?documentId=${encodeURIComponent(pdfUrl)}`);
          const statusData = await statusResponse.json();

          if (statusData.status !== 'completed') {
            console.log('Initializing RAG processing...');
            const response = await fetch('/api/rag_chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                documentId: pdfUrl,
                content: fullText
              }),
            });

            if (!response.ok) {
              const errorData = await response.text();
              console.error('Processing error:', errorData);
              throw new Error('Failed to process document for RAG');
            }

            const result = await response.json();
            console.log('RAG processing result:', result);
          } else {
            console.log('Document already processed');
          }
        } catch (error) {
          console.error('Error in RAG processing:', error);
          throw error;
        }
      }

    } catch (error) {
      console.error('Error in document load:', error);
      handleError(error as Error);
    }
  }, [handleError, pdfUrl]);

  // Handle File Upload
  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create a URL for the PDF file for viewing
      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);

      // Load the PDF and extract text
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      
      // Extract text from all pages
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }

      // Generate a unique document ID
      const documentId = `doc_${Date.now()}`;

      console.log('Processing document:', { documentId, textLength: fullText.length });

      // Process the content
      const processingResponse = await fetch('/api/rag_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          content: fullText
        }),
      });

      if (!processingResponse.ok) {
        const errorText = await processingResponse.text();
        console.error('Processing error:', errorText);
        throw new Error('Failed to process document');
      }

      const result = await processingResponse.json();
      console.log('Document processing result:', result);

      // Store the document ID in state for chat
      setDocumentId(documentId);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in file upload:', error);
      setError('Failed to process file. Please try again.');
      setIsLoading(false);
    }
  };

  // Move to Next or Previous Section
  const moveSection = useCallback((delta: number) => {
    setCurrentSectionIndex((prevIndex) => {
      const newIndex = prevIndex + delta;
      return newIndex >= 0 && newIndex < filteredSections.length ? newIndex : prevIndex;
    });
  }, [filteredSections.length]);

  // Handle Text-to-Speech Play/Pause
  const handleTextToSpeech = useCallback(() => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      setCurrentReadingText(null);
      // Remove any existing selection
      window.getSelection()?.removeAllRanges();
    } else {
      setIsReading(true);
      const textToRead = filteredSections[currentSectionIndex]?.text || '';
      const newUtterance = new SpeechSynthesisUtterance(textToRead);
      newUtterance.rate = readingSpeed;

      // Find and select the text
      const textElements = document.querySelectorAll('.rpv-core__text-layer-text');
      textElements.forEach((element) => {
        const text = element.textContent || '';
        if (text.includes(textToRead)) {
          // Create a range and select the text
          const range = document.createRange();
          range.selectNodeContents(element);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          
          // Scroll the selected text into view
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      newUtterance.onend = () => {
        setIsReading(false);
        setCurrentReadingText(null);
        // Remove selection when done
        window.getSelection()?.removeAllRanges();
        moveSection(1);
      };

      newUtterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance error:', event);
        setIsReading(false);
        setCurrentReadingText(null);
        // Remove selection on error
        window.getSelection()?.removeAllRanges();
      };

      window.speechSynthesis.speak(newUtterance);
    }
  }, [isReading, filteredSections, currentSectionIndex, readingSpeed, moveSection]);

  // Debounced Search Functionality
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim() === '' || !pdfUrl) {
        setSearchResults([]);
        return;
      }
      try {
        const response = await axios.post('/api/search', { query, pdfUrl });
        setSearchResults(response.data.results);
      } catch (error) {
        console.error('Error searching:', error);
      }
    }, 300),
    [pdfUrl]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Handle Search Input Change
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle Zoom In
  const handleZoomIn = useCallback(() => {
    setCurrentScale((prevScale) => Math.min(prevScale + 0.1, 3));
  }, []);

  // Handle Zoom Out
  const handleZoomOut = useCallback(() => {
    setCurrentScale((prevScale) => Math.max(prevScale - 0.1, 0.5));
  }, []);

  // Handle Go To Page
  const handleGoToPage = useCallback(() => {
    const pageNumber = parseInt(goToPageInput, 10);
    if (pageNumber >= 1 && pageNumber <= numPages) {
      jumpToPage(pageNumber);
      setCurrentPage(pageNumber);
    }
    setGoToPageInput('');
  }, [goToPageInput, numPages, jumpToPage]);

  // Handle Upload Button Click
  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Update PDF URL from Search Params
  useEffect(() => {
    const url = searchParams.get('url');
    if (url) {
      setPdfUrl(url);
    }
  }, [searchParams]);

  // Sidebar items configuration
  const sidebarItems = [
    { icon: <FiHome />, text: "Dashboard", href: "/", active: false },
    { icon: <FiBook />, text: "Library", href: "/library", active: false },
    { icon: <FiRepeat />, text: "Swipe to Learn", href: "/swipe-learn", active: false },
    { icon: <FiFileText />, text: "My Notes", href: "/notes", active: false },
    { icon: <FiMic />, text: "Lectures", href: "/lectures", active: false },
    { icon: <FiUsers />, text: "Classes", href: "/classes", active: false },
    { icon: <FiCalendar />, text: "Schedule", href: "/schedule", active: false }
  ];

  // Sidebar Item Component
  const SidebarItem = ({ icon, text, href, active = false, isDark, isCollapsed }: SidebarItemProps) => {
    return (
      <Link
        href={href}
        className={`flex items-center ${
          isCollapsed ? 'justify-center px-2' : 'px-4'
        } py-3 mb-2 
          transition-colors duration-200 rounded-lg
          ${active 
            ? `${isDark ? 'bg-gray-700 text-white' : 'bg-purple-100 text-purple-600'}`
            : `${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`
          }`}
        title={isCollapsed ? text : undefined}
      >
        {React.cloneElement(icon, { 
          size: 20,
          className: active 
            ? (isDark ? 'text-white' : 'text-purple-600')
            : (isDark ? 'text-gray-400' : 'text-gray-500')
        })}
        {!isCollapsed && <span className="font-medium ml-3">{text}</span>}
      </Link>
    );
  };

  // Add mounted check to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-1 h-screen">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0
          ${isSidebarCollapsed ? 'w-20' : 'w-64'} 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0
          ${theme === 'dark' ? 'bg-gray-800/95' : 'bg-white/90'} 
          border-r border-gray-700 
          transition-all duration-300 ease-in-out 
          backdrop-blur-sm
          z-50
        `}>
          {/* Logo Section */}
          <div className={`flex items-center p-6 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <Image
              src="/logo.png"
              alt="StudyLeaf Logo"
              width={32}
              height={32}
              className={isSidebarCollapsed ? 'mx-auto' : 'mr-3'}
            />
            {!isSidebarCollapsed && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-600">
                StudyLeaf
              </span>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-6 bg-gray-800 rounded-full p-1.5 border border-gray-700 flex items-center justify-center"
          >
            {isSidebarCollapsed ? (
              <FiChevronRight className="h-4 w-4 text-gray-400" />
            ) : (
              <FiChevronLeft className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {/* Navigation */}
          <nav className="mt-6 px-2">
            {/* Main Navigation */}
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  text={item.text}
                  href={item.href}
                  active={item.active}
                  isDark={theme === 'dark'}
                  isCollapsed={isSidebarCollapsed}
                />
              ))}
            </div>

            {/* Logout Button */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <SidebarItem
                icon={<FiLogOut />}
                text="Logout"
                href="/logout"
                active={false}
                isDark={theme === 'dark'}
                isCollapsed={isSidebarCollapsed}
              />
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300
          ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
        `}>
          {/* Top Search Bar */}
          <header className={`fixed top-0 left-0 right-0 z-20 ${
            theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'
          } shadow-md backdrop-blur-sm px-4 py-3`}>
            {/* Search Bar */}
            <div className="w-full max-w-2xl mx-auto relative">
              <Input
                type="text"
                placeholder="Search document for relevant content..."
                className={`h-10 pl-10 pr-4 w-full rounded-full ${
                  theme === 'dark' 
                    ? 'bg-gray-700/50 text-white border-gray-600' 
                    : 'bg-gray-100 text-gray-900 border-gray-300'
                } focus:ring-2 focus:ring-purple-400`}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {/* Search Results Dropdown */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute left-0 z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                      onClick={() => {
                        jumpToPage(result.page);
                        setSearchQuery('');
                        setIsSearchFocused(false);
                      }}
                    >
                      <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{result.content}</p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Page {result.page}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle - Top Right */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors"
            >
              {theme === 'dark' ? (
                <FiSun size={20} className="text-gray-300 hover:text-white" />
              ) : (
                <FiMoon size={20} className="text-gray-600 hover:text-gray-900" />
              )}
            </button>
          </header>

          {/* PDF Viewer Content */}
          <main className={`flex-1 overflow-y-auto pt-16 pb-20 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
          }`}>
            {/* PDF Viewer with AI Panel Container */}
            <div className="relative flex w-full h-full">
              {/* PDF Viewer */}
              <div className="flex-1 bg-transparent flex justify-center items-start overflow-y-auto p-4">
                <Worker workerUrl={`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`}>
                  {pdfUrl ? (
                    <ErrorBoundary>
                      <div
                        ref={wrapperRef}
                        className="flex justify-center items-start w-full h-full"
                      >
                        <div
                          ref={containerRef}
                          className="transition-all duration-300 w-full max-w-5xl mx-auto"
                          style={{
                            transform: `scale(${currentScale})`,
                            transformOrigin: 'center top',
                            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                            borderRadius: '8px',
                            backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
                          }}
                        >
                          <Viewer
                            fileUrl={pdfUrl}
                            plugins={[
                              selectionModePluginInstance,
                              toolbarPluginInstance,
                              defaultLayoutPluginInstance,
                              pageNavigationPluginInstance,
                            ]}
                            onDocumentLoad={handleDocumentLoad}
                            onPageChange={(e: any) => setCurrentPage(e.currentPage)}
                            defaultScale={1.0}
                          />
                        </div>
                      </div>
                    </ErrorBoundary>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-gray-400">Please upload a PDF to view.</p>
                    </div>
                  )}
                </Worker>
              </div>

              {/* Remove the empty AI Panel container div since we're using a floating button now */}
              {/* The AI Panel is rendered separately with its own positioning */}
            </div>
            {/* Bottom Control Bar */}
            <div className={`fixed bottom-0 left-0 right-0 ${
              theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'
            } backdrop-blur-sm shadow-up px-4 py-3 border-t ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-center space-x-6 max-w-2xl mx-auto">
                {/* Backward Button */}
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    aria-label="Go Backward"
                    className="flex items-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-2 rounded-full shadow-md hover:from-purple-600 hover:to-indigo-600 transition-colors duration-300"
                    onClick={() => moveSection(-1)}
                  >
                    <FiChevronLeft className="h-5 w-5" />
                  </Button>
                </motion.div>

                {/* Play/Pause Button */}
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    aria-label={isReading ? 'Pause reading' : 'Play reading'}
                    className="flex items-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-2 rounded-full shadow-md hover:from-purple-600 hover:to-indigo-600 transition-colors duration-300"
                    onClick={handleTextToSpeech}
                  >
                    {isReading ? <FiPause className="h-5 w-5" /> : <FiPlay className="h-5 w-5" />}
                  </Button>
                </motion.div>

                {/* Forward Button */}
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    aria-label="Go Forward"
                    className="flex items-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-2 rounded-full shadow-md hover:from-purple-600 hover:to-indigo-600 transition-colors duration-300"
                    onClick={() => moveSection(1)}
                  >
                    <FiChevronRight className="h-5 w-5" />
                  </Button>
                </motion.div>

                {/* Speed Controls */}
                <div className="flex items-center space-x-2 ml-4">
                  <FiActivity className={`h-4 w-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className={`w-24 h-1 rounded-lg appearance-none cursor-pointer ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                    }`}
                  />
                  <span className={`text-xs min-w-[32px] ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {speed}x
                  </span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Add the PDFAIPanel component */}
      <PDFAIPanel
        pdfUrl={pdfUrl}
        pdfContent={pdfText}
        currentPage={currentPage}
        totalPages={numPages}
        theme={theme}
        onClose={() => setIsAIPanelVisible(false)}
        onFileUpload={(path) => setPdfUrl(path)}
      />

      {/* Hidden File Input */}
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => handleFileUpload(e.target.files![0])}
        className="hidden"
        ref={fileInputRef}
      />
    </div>
  );
};

export default PDFViewerPage;