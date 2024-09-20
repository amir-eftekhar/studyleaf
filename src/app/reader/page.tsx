'use client'

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiSearch, FiUpload, FiVolume2, FiHelpCircle, FiChevronDown, FiChevronUp, FiX } from "react-icons/fi"
import Script from 'next/script'
import Link from 'next/link'

// Add this type definition at the top of the file, after the imports
type PDFTextContent = {
  items: Array<{ str: string }>;
  styles: Record<string, unknown>;
};

function usePDF() {
  const [pdf, setPdf] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.5)
  const [numPages, setNumPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const [sections, setSections] = useState<string[]>([])
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)

  const loadPDF = async (source: string | ArrayBuffer) => {
    if (typeof window === 'undefined' || !(window as any).pdfjsLib) return

    try {
      const loadedPdf = await (window as any).pdfjsLib.getDocument(source).promise
      setPdf(loadedPdf)
      setNumPages(loadedPdf.numPages)
    } catch (error) {
      console.error("Error loading PDF:", error)
    }
  }

  const renderPage = async (pageNum: number) => {
    if (!pdf || !containerRef.current) return

    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale })
    
    const pageContainer = document.createElement('div')
    pageContainer.className = 'pdf-page'
    pageContainer.style.position = 'relative'
    pageContainer.style.width = `${viewport.width}px`
    pageContainer.style.height = `${viewport.height}px`
    
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width

    const renderContext = {
      canvasContext: context!,
      viewport: viewport
    }

    const textLayerDiv = document.createElement('div')
    textLayerDiv.className = 'textLayer'
    textLayerDiv.style.width = `${viewport.width}px`
    textLayerDiv.style.height = `${viewport.height}px`

    pageContainer.appendChild(canvas)
    pageContainer.appendChild(textLayerDiv)
    containerRef.current.appendChild(pageContainer)

    const renderTask = page.render(renderContext)

    renderTask.promise.then(() => {
      return page.getTextContent()
    }).then((textContent: PDFTextContent) => {
      // Render the text layer using renderTextLayer
      (window as any).pdfjsLib.renderTextLayer({
        textContent: textContent,
        container: textLayerDiv,
        viewport: viewport,
        textDivs: [] // This is where the text layer will be drawn
      }).promise.then(() => {
        console.log("Text layer rendered.")
      });
    })
  }

  const renderAllPages = async () => {
    if (!pdf || !containerRef.current) return
    containerRef.current.innerHTML = ''
    for (let i = 1; i <= numPages; i++) {
      await renderPage(i)
    }
  }

  useEffect(() => {
    if (pdf) {
      renderAllPages()
    }
  }, [pdf, scale])

  const changePage = (delta: number) => {
    setCurrentPage(prevPage => {
      const newPage = prevPage + delta
      return newPage >= 1 && newPage <= numPages ? newPage : prevPage
    })
  }

  const changeZoom = (delta: number) => {
    setScale(prevScale => {
      const newScale = prevScale + delta
      return newScale >= 0.5 && newScale <= 3 ? newScale : prevScale
    })
  }

  const searchText = () => {
    if (!searchTerm) return

    const textLayers = document.querySelectorAll('.textLayer')
    textLayers.forEach(textLayer => {
      textLayer.innerHTML = textLayer.innerHTML.replace(/<mark>/g, '').replace(/<\/mark>/g, '')
      const regex = new RegExp(searchTerm, 'gi')
      textLayer.innerHTML = textLayer.innerHTML.replace(regex, match => `<mark>${match}</mark>`)
    })
  }
  const getVisibleText = () => {
    if (!containerRef.current) return ''

    const visiblePages = Array.from(containerRef.current.querySelectorAll('.pdf-page'))
      .filter(page => {
        const rect = page.getBoundingClientRect()
        return rect.top < window.innerHeight && rect.bottom > 0
      })

    const visibleText = visiblePages
      .map(page => page.querySelector('.textLayer')?.textContent || '')
      .join(' ')

    return visibleText.trim()
  }

  useEffect(() => {
    if (pdf) {
      renderAllPages().then(() => {
        const allText = getVisibleText()
        const newSections = splitTextIntoSections(allText)
        setSections(newSections)
        highlightCurrentSection()
      })
    }
  }, [pdf, scale])

  const splitTextIntoSections = (text: string): string[] => {
    const words = text.split(/\s+/)
    const sections: string[] = []
    let currentSection: string[] = []

    words.forEach((word) => {
      currentSection.push(word)
      if (currentSection.length >= 60 || word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) {
        sections.push(currentSection.join(' '))
        currentSection = []
      }
    })

    if (currentSection.length > 0) {
      sections.push(currentSection.join(' '))
    }

    return sections
  }

  const highlightCurrentSection = () => {
    const textLayers = document.querySelectorAll('.textLayer')
    textLayers.forEach(layer => {
      const text = layer.textContent || ''
      const sectionStart = text.indexOf(sections[currentSectionIndex])
      if (sectionStart !== -1) {
        const sectionEnd = sectionStart + sections[currentSectionIndex].length
        const range = document.createRange()
        range.setStart(layer.firstChild!, sectionStart)
        range.setEnd(layer.firstChild!, sectionEnd)
        const highlight = document.createElement('span')
        highlight.className = 'current-section'
        range.surroundContents(highlight)
      }
    })
  }

  useEffect(() => {
    if (pdf) {
      renderAllPages().then(() => {
        const allText = getVisibleText()
        const newSections = splitTextIntoSections(allText)
        setSections(newSections)
        highlightCurrentSection()
      })
    }
  }, [pdf, scale])

  useEffect(() => {
    highlightCurrentSection()
  }, [currentSectionIndex])

  return { loadPDF, changePage, changeZoom, scale, currentPage, numPages, containerRef, searchTerm, setSearchTerm, searchText, sections, currentSectionIndex, setCurrentSectionIndex }
}

export default function PDFReader() {
  const { loadPDF, changePage, changeZoom, scale, currentPage, numPages, containerRef, searchTerm, setSearchTerm, searchText, sections, currentSectionIndex, setCurrentSectionIndex } = usePDF()
  const [url, setUrl] = useState("")
  const [isReading, setIsReading] = useState(false)
  const [question, setQuestion] = useState("")
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTextSegment, setCurrentTextSegment] = useState<number>(0)
  const [textSegments, setTextSegments] = useState<string[]>([])
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null)
  const [showSections, setShowSections] = useState(true)

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

  const splitTextIntoSegments = (text: string): string[] => {
    return text.match(/[^\.!\?]+[\.!\?]+/g) || [];
  }

  const highlightTextSegment = (segmentIndex: number) => {
    const textLayers = document.querySelectorAll('.textLayer');
    textLayers.forEach(layer => {
      const spans = layer.querySelectorAll('span');
      spans.forEach((span, index) => {
        if (index === segmentIndex) {
          span.classList.add('highlight');
        } else {
          span.classList.remove('highlight');
        }
      });
    });
  }


  const handleTextClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const clickedElement = event.target as HTMLElement;
    if (clickedElement.tagName === 'SPAN') {
      const textLayer = clickedElement.closest('.textLayer');
      if (textLayer) {
        const spans = Array.from(textLayer.querySelectorAll('span'));
        const clickedIndex = spans.indexOf(clickedElement);
        handleTextToSpeech(clickedIndex);
      }
    }
  };

  const getVisibleText = () => {
    if (!containerRef.current) return ''

    const visiblePages = Array.from(containerRef.current.querySelectorAll('.pdf-page'))
      .filter(page => {
        const rect = page.getBoundingClientRect()
        return rect.top < window.innerHeight && rect.bottom > 0
      })

    const visibleText = visiblePages
      .map(page => page.querySelector('.textLayer')?.textContent || '')
      .join(' ')

    return visibleText.trim()
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

  const handleTextToSpeech = async (startIndex: number = currentSectionIndex) => {
    if (isReading) {
      // Stop reading
      window.speechSynthesis.cancel()
      setIsReading(false)
    } else {
      // Start reading
      setIsReading(true)
      try {
        for (let i = startIndex; i < sections.length; i++) {
          if (!isReading) break // Stop if reading was cancelled
          setCurrentSectionIndex(i)
          const utterance = new SpeechSynthesisUtterance(sections[i])
          window.speechSynthesis.speak(utterance)
          await new Promise(resolve => {
            utterance.onend = resolve
          })
        }
      } catch (error) {
        console.error('Error in text-to-speech:', error)
      }
      setIsReading(false)
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup: cancel any ongoing speech when component unmounts
      window.speechSynthesis.cancel()
    }
  }, [])

  const moveSection = (delta: number) => {
    setCurrentSectionIndex(prevIndex => {
      const newIndex = prevIndex + delta
      return newIndex >= 0 && newIndex < sections.length ? newIndex : prevIndex
    })
  }

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
        }
        .pdf-page {
          margin-bottom: 20px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          position: relative;
        }
        .textLayer {
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          opacity: 0.2;
          line-height: 1.0;
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
                  <Button variant="outline" size="icon" onClick={searchText}>
                    <FiSearch />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={() => handleTextToSpeech()}>
                    <FiVolume2 className="mr-2" />
                    {isReading ? 'Stop Reading' : 'Read Aloud'}
                  </Button>
                  <Input 
                    type="text" 
                    placeholder="Ask a question..." 
                    className="w-64"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  <Button variant="outline" onClick={handleAskQuestion}>
                    <FiHelpCircle className="mr-2" />
                    Ask
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-hidden flex">
          <div className="pdf-container h-full flex-1" ref={containerRef} onClick={handleTextClick}>
            {/* PDF pages will be rendered here */}
          </div>
          {showSections && (
            <div className="w-1/4 bg-white p-4 overflow-y-auto relative">
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute top-2 right-2"
                onClick={() => setShowSections(false)}
              >
                <FiX />
              </Button>
              <h3 className="text-lg font-semibold mb-2">Sections</h3>
              <div className="flex items-center justify-between mb-2">
                <Button variant="outline" size="sm" onClick={() => moveSection(-1)} disabled={currentSectionIndex === 0}>
                  <FiChevronUp />
                </Button>
                <Button variant="outline" size="sm" onClick={() => moveSection(1)} disabled={currentSectionIndex === sections.length - 1}>
                  <FiChevronDown />
                </Button>
              </div>
              <div className="section-list">
                {sections.slice(currentSectionIndex, currentSectionIndex + 2).map((section, index) => (
                  <div
                    key={currentSectionIndex + index}
                    className={`p-2 mb-2 cursor-pointer rounded ${index === 0 ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    onClick={() => handleSectionClick(currentSectionIndex + index)}
                  >
                    {index === 0 ? "Current: " : "Next: "}
                    {section}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
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
      <audio ref={audioRef} onEnded={() => setIsReading(false)} />
    </>
  )
}
