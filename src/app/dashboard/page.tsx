'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Home, User, MessageSquare, Calendar as CalendarIcon, Users, CreditCard, Menu, X, Search, Bell, Settings, ChevronRight, ChevronLeft } from 'lucide-react'
import HomeContent from './HomeContent'
import ProfileContent from './ProfileContent'
import MessagesContent from './MessagesContent'
import CalendarContent from './CalendarContent'
import MatchContent from './MatchContent'
import PaymentsContent from './PaymentsContent'
import SettingsContent from './SettingsContent'

const menuItems = [
  { icon: Home, label: 'Home', content: HomeContent },
  { icon: User, label: 'Profile', content: ProfileContent },
  { icon: MessageSquare, label: 'Messages', content: MessagesContent },
  { icon: CalendarIcon, label: 'Calendar', content: CalendarContent },
  { icon: Users, label: 'Match', content: MatchContent },
  { icon: CreditCard, label: 'Payments', content: PaymentsContent },
  { icon: Settings, label: 'Settings', content: SettingsContent },
]

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('Home')

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <AnimatePresence>
        <motion.aside
          initial={{ width: 200 }}
          animate={{ width: isOpen ? 200 : 64 }}
          exit={{ width: 64 }}
          className="bg-white dark:bg-gray-800 h-screen shadow-lg overflow-hidden flex flex-col"
        >
          <div className="p-4 flex items-center justify-between">
            {isOpen && <h2 className="text-xl font-bold text-purple-600 dark:text-purple-400">TutorConnect</h2>}
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              {isOpen ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
            </Button>
          </div>
          <nav className="flex-1 space-y-2 p-2">
            {menuItems.map((item) => (
              <TooltipProvider key={item.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTab === item.label ? "default" : "ghost"}
                      className={`w-full justify-start ${isOpen ? '' : 'justify-center'}`}
                      onClick={() => setActiveTab(item.label)}
                    >
                      <item.icon className={`h-5 w-5 ${isOpen ? 'mr-2' : ''}`} />
                      {isOpen && item.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </nav>
        </motion.aside>
      </AnimatePresence>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex-1 px-4">
              <div className="relative max-w-sm">
                <Input 
                  type="search" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 w-full rounded-full border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-6 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {menuItems.find(item => item.label === activeTab)?.content()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}