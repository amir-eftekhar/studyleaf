'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { ThemeProvider } from '@/contexts/ThemeContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </NextThemeProvider>
    </SessionProvider>
  )
}
