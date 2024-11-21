'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiBook, FiHeadphones, FiFileText, FiLock, FiChrome, FiAward } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'
import logoSrc from '@/app/img/logo.png'

export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
        }`}
      >
        {/* Rest of your landing page JSX */}
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-2xl font-bold text-indigo-600">
              <Image src={logoSrc} alt="StudyLeaf Logo" width={64} height={64} className="mr-0" />
              <span>StudyLeaf</span>
            </Link>
            {/* ... rest of the navigation ... */}
          </nav>
        </div>
      </header>

      {/* ... rest of the landing page sections ... */}
    </div>
  )
} 