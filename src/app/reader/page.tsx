'use client'

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, 
  FiSearch, FiUpload, FiVolume2, FiHelpCircle, FiChevronDown, 
  FiChevronUp, FiX, FiArrowRight, FiFileText
} from "react-icons/fi"
import Script from 'next/script'
import Link from 'next/link'
import usePDF from '@/hooks/usePDF'
import PDFAIPanel from './ai-pannle'

export default function PDFReader() {
  const { 
    loadPDF, 
    changePage, 
    changeZoom, 
    scale, 
    currentPage, 
    numPages, 
    containerRef, 
    searchTerm, 
    setSearchTerm, 
    sections, 
    currentSectionIndex, 
    setCurrentSectionIndex, 
    fullText,
    goToPage,
    updateVisiblePages
  } = usePDF()

  const [url, setUrl] = useState("")
  const [isReading, setIsReading] = useState(false)
  const [question, setQuestion] = useState("")
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTextSegment, setCurrentTextSegment] = useState<number>(0)
  const [textSegments, setTextSegments] = useState<string[]>([])
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null)
  const [showSections, setShowSections] = useState(false) // Changed default to false
  const [goToPageNumber, setGoToPageNumber] = useState('')
  const [readingSpeed, setReadingSpeed] = useState(1) // New state for reading speed
  const [showSpeedControl, setShowSpeedControl] = useState(false)

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url) loadPDF(url)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          loadPDF(e.target.result as ArrayBuffer)
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const handleAskQuestion = () => {
    // Implement Q&A functionality here
    console.log("Question asked:", question)
  }

  const handleSectionClick = (index: number) => {
    setCurrentSectionIndex(index)
    if (isReading) {
      handleTextToSpeech(index)
    }
  }

  const handleTextToSpeech = async (startIndex: number = currentSectionIndex, startPage: number = currentPage) => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      setIsReading(true);
      try {
        goToPage(startPage);
        const textToRead = sections.length > 0 ? sections.slice(startIndex).map(section => section.content).join(' ') : fullText;
        const newUtterance = new SpeechSynthesisUtterance(textToRead);
        
        newUtterance.rate = readingSpeed;

        newUtterance.onend = () => {
          setIsReading(false);
          setCurrentSectionIndex(sections.length - 1)
        };

        newUtterance.onboundary = (event) => {
          const wordIndex = event.charIndex
          const sectionIndex = sections.findIndex((section, index) => {
            const sectionStart = sections.slice(0, index).map(s => s.content).join(' ').length
            const sectionEnd = sectionStart + section.content.length
            return wordIndex >= sectionStart && wordIndex < sectionEnd
          })
          if (sectionIndex !== -1) {
            setCurrentSectionIndex(sectionIndex)
            scrollToSection(sectionIndex)
          }
        }

        newUtterance.onerror = (event) => {
          console.error('SpeechSynthesisUtterance error:', event);
          setIsReading(false);
        };

        setUtterance(newUtterance);
        window.speechSynthesis.speak(newUtterance);
      } catch (error) {
        console.error('Error in text-to-speech:', error);
        setIsReading(false);
      }
    }
  }

  const scrollToSection = (sectionIndex: number) => {
    if (!containerRef.current) return

    const section = sections[sectionIndex];
    if (section && 'element' in section && section.element) {
      (section.element as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup: cancel any ongoing speech when component unmounts
      window.speechSynthesis.cancel();
    };
  }, []);

  const moveSection = (delta: number) => {
    setCurrentSectionIndex(prevIndex => {
      const newIndex = prevIndex + delta
      return newIndex >= 0 && newIndex < sections.length ? newIndex : prevIndex
    })
  }

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault()
    const pageNumber = parseInt(goToPageNumber)
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= numPages) {
      goToPage(pageNumber)
      if (isReading) {
        handleTextToSpeech(currentSectionIndex, pageNumber)
      }
    }
    setGoToPageNumber('')
  }

  useEffect(() => {
    const handleScroll = () => {
      updateVisiblePages()
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [updateVisiblePages])

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.min.js" 
        onLoad={() => {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js'
        }}
      />
      <style jsx global>{`
        .pdf-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow-y: auto;
          padding: 20px;
          position: relative;
          background-color: #f5f5f5; /* Example background */
          width: 70%; /* Example width */
          margin: 0 auto; /* Example margin */
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .pdf-page {
          margin-bottom: 20px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          position: relative;
          border-radius: 8px; /* Example border-radius */
        }
        .textLayer {
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          opacity: 0.3; /* Adjust opacity for text readability */
          line-height: 1.2; /* Adjust line height */
          font-family: 'Arial', sans-serif; /* Choose a suitable font */
          user-select: text;
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
        }
        .textLayer > span {
          color: transparent;
          position: absolute;
          white-space: pre;
          cursor: text;
          transform-origin: 0% 0%;
        }
        .textLayer .highlight {
          margin: -1px;
          padding: 1px;
          background-color: rgb(180, 0, 170);
          border-radius: 4px;
        }
        .textLayer .highlight.selected {
          background-color: rgb(0, 100, 0);
        }
        .textLayer ::selection { background: rgba(0,0,255,0.3); }
        mark { background-color: yellow; }
        .pdf-controls {
          position: sticky;
          top: 0;
          background-color: white;
          z-index: 10;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .highlight {
          background-color: yellow;
        }
        .current-section {
          background-color: rgba(173, 216, 230, 0.5);
        }
        .section-list {
          max-height: 200px;
          overflow-y: auto;
        }
        .text-overlay {
          color: transparent;
          user-select: none;
        }
        .text-overlay div {
          background-color: rgba(255, 255, 255, 0.7);
          color: black;
        }
        .current-section {
          background-color: yellow !important;
        }
        .textLayer span:hover {
          background-color: blue;
          color: white;
        }
        .textLayer .current-word {
          background-color: lightgreen !important;
          color: black !important;
        }
        /* Bottom Tab Styles */
        .bottom-tab {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: #f9fafb;
          box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
          padding: 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: transform 0.3s ease-in-out;
          z-index: 20;
        }
        .bottom-tab.hidden {
          transform: translateY(100%);
        }
        .reading-text {
          flex-1;
          margin-right: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .reading-controls {
          display: flex;
          align-items: center;
        }
        /* Slider Styles */
        .slider-container {
          display: flex;
          align-items: center;
          margin-left: 20px;
        }
        .slider {
          -webkit-appearance: none;
          width: 150px;
          height: 5px;
          border-radius: 5px;
          background: linear-gradient(to right, #6b21a8, #9333ea);
          outline: none;
          opacity: 0.7;
          transition: opacity .2s;
        }
        .slider:hover {
          opacity: 1;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #4c1d95;
          cursor: pointer;
          border: none;
        }
        .slider::-moz-range-thumb {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #4c1d95;
          cursor: pointer;
          border: none;
        }
        .speed-popup {
          position: absolute;
          right: 0;
          bottom: 100%;
          background-color: white;
          padding: 10px;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .vertical-slider {
          -webkit-appearance: slider-vertical;
          width: 20px;
          height: 100px;
          writing-mode: bt-lr;
        }
        /* Sidebar styling (similar to the example) */
        .pdf-sidebar {
          width: 20%;
          min-width: 250px;
          max-width: 300px;
          border-left: 1px solid #e5e7eb;
          background-color: #f9fafb;
          padding: 20px;
          position: relative;
          box-shadow: -5px 0 10px rgba(0, 0, 0, 0.1); /* Example box shadow */
        }
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .sidebar-title {
          font-size: 1.2rem;
          font-weight: bold;
        }
        .sidebar-list {
          list-style: none;
          padding: 0;
        }
        .sidebar-item {
          padding: 10px;
          border-bottom: 1px solid #e5e7eb;
          cursor: pointer;
        }
        .sidebar-item:last-child {
          border-bottom: none;
        }
        .sidebar-item.active {
          background-color: #e5f1ff;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="text-2xl font-bold text-indigo-600">
                    EduPlatform
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="pdf-controls">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-4">
                <form onSubmit={handleUrlSubmit} className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="text" 
                      placeholder="Enter PDF URL" 
                      value={url} 
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" variant="outline">
                      Load
                    </Button>
                  </div>
                </form>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    id="file-upload" 
                  />
                  <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                    <FiUpload className="mr-2" />
                    Upload PDF
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={() => changePage(-1)} disabled={currentPage === 1}>
                    <FiChevronLeft />
                  </Button>
                  <span className="text-sm font-medium">
                    Page {currentPage} of {numPages}
                  </span>
                  <Button variant="outline" size="icon" onClick={() => changePage(1)} disabled={currentPage === numPages}>
                    <FiChevronRight />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={() => changeZoom(-0.1)}>
                    <FiZoomOut />
                  </Button>
                  <span className="text-sm font-medium w-16 text-center">{Math.round(scale * 100)}%</span>
                  <Button variant="outline" size="icon" onClick={() => changeZoom(0.1)}>
                    <FiZoomIn />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-40"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline" size="icon" >
                    <FiSearch />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <form onSubmit={handleGoToPage} className="flex items-center space-x-2">
                    <Input 
                      type="number" 
                      placeholder="Go to page" 
                      value={goToPageNumber}
                      onChange={(e) => setGoToPageNumber(e.target.value)}
                      className="w-20"
                    />
                    <Button type="submit" variant="outline" size="sm">Go</Button>
                  </form>
                  <Button variant="outline" onClick={() => handleTextToSpeech()}>
                    <FiVolume2 className="mr-2" />
                    {isReading ? 'Stop Reading' : 'Read Aloud'}
                  </Button>
                  <div className="relative">
                    <Button variant="outline" onClick={() => setShowSpeedControl(!showSpeedControl)}>
                      Speed: {readingSpeed.toFixed(1)}x
                    </Button>
                    {showSpeedControl && (
                      <div className="speed-popup">
                        <input 
                          type="range" 
                          min="0.5" 
                          max="2" 
                          step="0.1" 
                          value={readingSpeed} 
                          onChange={(e) => {
                            const newSpeed = parseFloat(e.target.value);
                            setReadingSpeed(newSpeed);
                            if (utterance) {
                              utterance.rate = newSpeed;
                            }
                          }}
                          className="vertical-slider"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-hidden flex">
          <div className="flex-1 relative">
            <div className="pdf-container h-full flex-1" ref={containerRef}>
              {/* PDF pages will be rendered here */}
            </div>
          </div>
          <div className="pdf-sidebar"> 
            {/* Sidebar for Table of Contents and AI Panel */}
            <div className="sidebar-header">
              <h3 className="sidebar-title">Table of Contents</h3>
              {/* Close Button for Sidebar */}
              <Button variant="outline" size="icon" onClick={() => setShowSections(true)}>
                <FiX />
              </Button>
            </div>
            <ul className="sidebar-list">
              {/* Display Table of Contents here */}
              {sections.map((section, index) => (
                <li 
                  key={section.id}
                  className={`sidebar-item ${index === currentSectionIndex ? 'active' : ''}`}
                  onClick={() => handleSectionClick(index)}
                >
                                    <FiFileText className="mr-2" />
                  {section.content}
                </li>
              ))}
            </ul>
            <div className="sidebar-header mt-4">
              <h3 className="sidebar-title">AI Chat</h3>
            </div>
            <PDFAIPanel />
          </div>
        </main>

        {/* Bottom Tab for Sections and Reading Controls */}
        <div className={`bottom-tab ${showSections ? 'transform translate-y-0' : 'hidden'}`}>
          <div className="reading-text">
            {isReading && sections[currentSectionIndex]?.content}
          </div>
          <div className="reading-controls">
            <Button variant="outline" size="icon" onClick={() => moveSection(1)} disabled={currentSectionIndex >= sections.length - 1}>
              <FiArrowRight />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowSections(false)}>
              <FiX />
            </Button>
          </div>
        </div>

        {showSections && (
          <div className="bottom-tab transform translate-y-0">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mb-2">Sections</h3>
              <Button variant="outline" size="icon" onClick={() => setShowSections(false)}>
                <FiX />
              </Button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Button variant="outline" size="sm" onClick={() => moveSection(-1)} disabled={currentSectionIndex === 0}>
                <FiChevronUp />
              </Button>
              <Button variant="outline" size="sm" onClick={() => moveSection(1)} disabled={currentSectionIndex === sections.length - 1}>
                <FiChevronDown />
              </Button>
            </div>
            <div className="section-list">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`p-2 mb-2 cursor-pointer rounded ${index === currentSectionIndex ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => handleSectionClick(index)}
                >
                  {section.content}
                </div>
              ))}
            </div>
            <div className="reading-controls mt-4">
              <Button variant="outline" size="icon" onClick={() => moveSection(1)} disabled={currentSectionIndex >= sections.length - 1}>
                <FiArrowRight />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setShowSections(false)}>
                <FiX />
              </Button>
            </div>
          </div>
        )}

        {!showSections && (
          <Button 
            variant="outline" 
            className="fixed bottom-4 right-4"
            onClick={() => setShowSections(true)}
          >
            Show Sections
          </Button>
        )}
      </div>
      <audio ref={audioRef} />
    </>
  )
}