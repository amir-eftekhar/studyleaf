import React from 'react'

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  isDark: boolean
  className?: string
}

export function TabButton({ active, onClick, icon, label, isDark, className = '' }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
        active
          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
          : isDark
          ? 'bg-gray-800 text-gray-300 hover:bg-purple-600'
          : 'bg-white text-gray-600 hover:bg-purple-100'
      } ${className}`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  )
}
