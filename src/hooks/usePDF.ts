import { useState, useEffect, useRef, useCallback } from "react"

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
  const [sections, setSections] = useState<{ id: string; content: string }[]>([])
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [fullText, setFullText] = useState('')
  const [visiblePages, setVisiblePages] = useState<number[]>([])
  const renderedPagesRef = useRef<Set<number>>(new Set())

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

  const renderPage = useCallback(async (pageNum: number): Promise<[string, boolean]> => {
    if (!pdf || !containerRef.current || renderedPagesRef.current.has(pageNum)) return ['', false]
  
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale })
  
    const pageContainer = document.createElement('div')
    pageContainer.className = 'pdf-page'
    pageContainer.style.position = 'relative'
    pageContainer.style.width = `${viewport.width}px`
    pageContainer.style.height = `${viewport.height}px`
    pageContainer.setAttribute('data-page-number', pageNum.toString())
  
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width
    canvas.style.width = `${viewport.width}px`
    canvas.style.height = `${viewport.height}px`
  
    const renderContext = {
      canvasContext: context!,
      viewport: viewport
    }
  
    pageContainer.appendChild(canvas)
    containerRef.current.appendChild(pageContainer)
  
    const renderTask = page.render(renderContext)
  
    let pageText = ''
    try {
      await renderTask.promise
      const textContent = await page.getTextContent()
      pageText = textContent.items.map((item: { str: string }) => item.str).join(' ')
    } catch (error) {
      console.error("Error rendering page:", error)
    }
  
    renderedPagesRef.current.add(pageNum)
    return [pageText, true]
  }, [pdf, scale])

  const renderVisiblePages = useCallback(async () => {
    if (!pdf || !containerRef.current) return
    const pagesToRender = new Set<number>()
    const pagesToRemove = new Set<number>()
    
    // Determine pages to render and remove
    for (let i = -5; i <= 5; i++) {
      const pageNum = currentPage + i
      if (pageNum >= 1 && pageNum <= numPages) {
        pagesToRender.add(pageNum)
      }
    }

    // Identify pages to remove (more than 5 pages away from current page)
    renderedPagesRef.current.forEach(pageNum => {
      if (Math.abs(pageNum - currentPage) > 5) {
        pagesToRemove.add(pageNum)
      }
    })

    // Remove pages that are out of range
    pagesToRemove.forEach(pageNum => {
      const pageElement = containerRef.current?.querySelector(`[data-page-number="${pageNum}"]`)
      if (pageElement) {
        pageElement.remove()
      }
      renderedPagesRef.current.delete(pageNum)
    })

    // Render new pages
    const newlyRenderedPages: number[] = []
    for (const pageNum of Array.from(pagesToRender)) {
      const existingPage = containerRef.current.querySelector(`[data-page-number="${pageNum}"]`)
      if (!existingPage && !renderedPagesRef.current.has(pageNum)) {
        const [_, wasRendered] = await renderPage(pageNum)
        if (wasRendered) {
          newlyRenderedPages.push(pageNum)
        }
      }
    }

    // Update sections for newly rendered pages
    if (newlyRenderedPages.length > 0) {
      const newText = await Promise.all(newlyRenderedPages.map(async pageNum => {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        return textContent.items.map((item: { str: string }) => item.str).join(' ')
      }))

      const updatedFullText = fullText + ' ' + newText.join(' ').trim()
      setFullText(updatedFullText)
      const newSections = splitTextIntoSections(updatedFullText)
      setSections(newSections)
    }

    // Ensure pages are in the correct order
    const sortedPages = Array.from(containerRef.current.children)
      .sort((a, b) => {
        const aNum = parseInt(a.getAttribute('data-page-number') || '0', 10)
        const bNum = parseInt(b.getAttribute('data-page-number') || '0', 10)
        return aNum - bNum
      })
    sortedPages.forEach(page => containerRef.current!.appendChild(page))

  }, [pdf, currentPage, numPages, renderPage, fullText])

  const updateVisiblePages = useCallback(() => {
    if (!containerRef.current) return
    const pageElements = containerRef.current.querySelectorAll('.pdf-page')
    const visiblePageNumbers: number[] = []
    pageElements.forEach((page) => {
      const rect = page.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const pageNumber = parseInt(page.getAttribute('data-page-number') || '0', 10)
        if (pageNumber > 0) {
          visiblePageNumbers.push(pageNumber)
        }
      }
    })
    setVisiblePages(visiblePageNumbers)
    setCurrentPage(visiblePageNumbers[0] || currentPage)
  }, [currentPage])

  const goToPage = useCallback((pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= numPages) {
      setCurrentPage(pageNumber)
    }
  }, [numPages])

  const changePage = (delta: number) => {
    setCurrentPage(prevPage => {
      const newPage = prevPage + delta
      return newPage >= 1 && newPage <= numPages ? newPage : prevPage
    })
  }

  const changeZoom = (delta: number) => {
    setScale(prevScale => {
      const newScale = prevScale + delta
      return Math.min(Math.max(newScale, 0.5), 3)
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

  const splitTextIntoSections = (text: string): { id: string; content: string }[] => {
    const words = text.split(/\s+/)
    const sections: { id: string; content: string }[] = []
    let currentSection: string[] = []
    let sectionIndex = 0
  
    words.forEach((word) => {
      currentSection.push(word)
      if (currentSection.length >= 60 || word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) {
        sections.push({ id: `section-${sectionIndex}`, content: currentSection.join(' ') })
        currentSection = []
        sectionIndex++
      }
    })
  
    if (currentSection.length > 0) {
      sections.push({ id: `section-${sectionIndex}`, content: currentSection.join(' ') })
    }
  
    return sections
  }
  

  useEffect(() => {
    if (pdf) {
      renderVisiblePages()
    }
  }, [pdf, scale, currentPage, renderVisiblePages])

  useEffect(() => {
    const handleScroll = () => {
      updateVisiblePages()
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [updateVisiblePages])

  return { 
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
    // renderedPages removed
  }
}

export default usePDF
