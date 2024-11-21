'use client'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { FiBell } from 'react-icons/fi'
import MainLayout from '@/components/layout/MainLayout'

export default function NotificationsPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 bg-gradient-to-r ${
            isDark 
              ? 'from-indigo-400 to-indigo-600' 
              : 'from-indigo-500 to-indigo-700'
          } bg-clip-text text-transparent`}>
            Notifications
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Stay updated with your study progress and activities
          </p>
        </div>

        {/* Empty State */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`flex flex-col items-center justify-center p-12 rounded-xl border ${
            isDark 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isDark 
              ? 'bg-gray-700' 
              : 'bg-gray-100'
          }`}>
            <FiBell 
              size={32} 
              className={isDark ? 'text-gray-400' : 'text-gray-500'} 
            />
          </div>
          
          <h2 className={`text-xl font-semibold mb-2 ${
            isDark ? 'text-gray-200' : 'text-gray-800'
          }`}>
            No notifications yet
          </h2>
          
          <p className={`text-center max-w-md ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            We'll notify you when there are updates about your study sets, 
            upcoming study sessions, or other important activities.
          </p>
        </motion.div>
      </div>
    </MainLayout>
  )
}
