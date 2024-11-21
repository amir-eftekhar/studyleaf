'use client'
import React, { useState, useEffect, ReactElement } from 'react';
import { FiMenu, FiX, FiSearch, FiSun, FiMoon, FiBell, FiHome, FiBook, FiFileText, 
  FiMic, FiUsers, FiCalendar, FiLayers, FiBookOpen, FiLogOut, FiChevronLeft, FiChevronRight, FiUser, FiSettings, FiRepeat } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface MainLayoutProps {
  children: React.ReactNode;
  showSearch?: boolean;
}

interface SidebarItemProps {
  icon: ReactElement;
  text: string;
  href: string;
  active?: boolean;
  isDark: boolean;
  isCollapsed: boolean;
}

interface ProfileMenuProps {
  isDark: boolean;
  userName: string;
  userEmail: string;
  onClose: () => void;
}

interface UserData {
  name: string;
  email: string;
}

export default function MainLayout({ children, showSearch = true }: MainLayoutProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const sidebarItems = [
    { icon: <FiHome />, text: "Dashboard", href: "/", active: true },
    { icon: <FiBook />, text: "Library", href: "/library", active: false },
    { icon: <FiRepeat />, text: "Swipe to Learn", href: "/swipe-learn", active: false },
    { icon: <FiFileText />, text: "My Notes", href: "/notes", active: false },
    { icon: <FiMic />, text: "Lecture", href: "/lecture", active: false },
    { icon: <FiUsers />, text: "Classes", href: "/classes", active: false },
    { icon: <FiCalendar />, text: "Schedule", href: "/schedule", active: false }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#profile-menu') && !target.closest('#profile-button')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/user/me');
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    setIsThemeLoaded(true);
  }, []);

  if (!isThemeLoaded) {
    return null;
  }

  const SidebarItem = ({ icon, text, href, active = false, isDark, isCollapsed }: SidebarItemProps) => {
    return (
      <Link
        href={href}
        className={`flex items-center ${
          isCollapsed ? 'justify-center px-2' : 'px-8'
        } py-4 mb-2 
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

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-1 h-screen">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0
          ${isSidebarCollapsed ? 'w-20' : 'w-64'} 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0
          ${isDark ? 'bg-gray-800/95' : 'bg-white/90'} 
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
            className="absolute -right-3 top-8 bg-gray-800 rounded-full p-1.5 border border-gray-700 flex items-center justify-center"
          >
            {isSidebarCollapsed ? (
              <FiChevronRight className="h-4 w-4 text-gray-400" />
            ) : (
              <FiChevronLeft className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {/* Navigation */}
          <nav className="mt-6 px-4">
            {/* Main Navigation */}
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  {...item}
                  isDark={isDark}
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
                isDark={isDark}
                isCollapsed={isSidebarCollapsed}
              />
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300
          ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
        `}>
          {/* Top Bar */}
          <div className={`${
            isDark ? 'bg-gray-800/80' : 'bg-white/80'
          } border-b border-gray-700 p-6 sticky top-0 z-40 backdrop-blur-sm transition-all duration-200`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white mr-4"
              >
                <FiMenu size={24} />
              </button>

              {/* Search Bar */}
              {showSearch && (
                <div className="flex-1 max-w-4xl mx-auto">
                  <div className="relative">
                    <input
                      type="text"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-base ${
                        isDark ? 'bg-gray-700/50 text-white border-gray-600' : 'bg-gray-100 text-gray-900'
                      } focus:ring-2 focus:ring-purple-400`}
                      placeholder="Search your sets, notes, or classes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              )}

              {/* Right Side Icons */}
              <div className="flex items-center space-x-4 ml-4">
                <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-400 hover:text-white">
                  {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
                </button>
                <button 
                  onClick={() => router.push('/notifications')}
                  className="p-2 rounded-lg text-gray-400 hover:text-white relative group"
                >
                  <FiBell size={20} />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Notifications
                  </div>
                </button>
                <div className="relative">
                  <button
                    id="profile-button"
                    className="relative group"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-600 cursor-pointer flex items-center justify-center text-white font-medium">
                      {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      View Profile
                    </div>
                  </button>

                  {/* Profile Menu Popover */}
                  {showProfileMenu && (
                    <div
                      id="profile-menu"
                      className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg py-1 z-50 ${
                        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                      }`}
                    >
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {userData?.name || 'User'}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {userData?.email || 'Loading...'}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            router.push('/profile');
                            setShowProfileMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            isDark 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          } flex items-center space-x-2`}
                        >
                          <FiUser size={16} />
                          <span>Your Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            router.push('/settings');
                            setShowProfileMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            isDark 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          } flex items-center space-x-2`}
                        >
                          <FiSettings size={16} />
                          <span>Settings</span>
                        </button>

                        <div className="border-t border-gray-700 my-1"></div>

                        <button
                          onClick={() => {
                            // Add logout logic here
                            router.push('/logout');
                            setShowProfileMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            isDark 
                              ? 'text-red-400 hover:bg-gray-700' 
                              : 'text-red-600 hover:bg-gray-100'
                          } flex items-center space-x-2`}
                        >
                          <FiLogOut size={16} />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
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

      {/* Add this before the final closing div */}
      <footer className={`${isDark ? 'bg-gray-800/90' : 'bg-white/90'} border-t border-gray-700 backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-4">
                <Image
                  src="/logo.png"
                  alt="StudyLeaf Logo"
                  width={32}
                  height={32}
                  className="mr-3"
                />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-600">
                  StudyLeaf
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Empowering students with innovative learning tools and AI-powered study solutions.
              </p>
            </div>

            {/* Resources */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Resources
              </h3>
              <ul className={`text-sm space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>Help Center</li>
                <li>Study Tips</li>
                <li>Blog</li>
                <li>API</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Contact Us
              </h3>
              <ul className={`text-sm space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>support@studyleaf.com</li>
                <li>1-800-STUDYLEAF</li>
                <li>Twitter: @studyleaf</li>
                <li>Discord Community</li>
              </ul>
            </div>
          </div>

          <div className={`mt-8 pt-8 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                &copy; 2024 StudyLeaf. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="/privacy" className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}>
                  Privacy Policy
                </Link>
                <Link href="/terms" className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}>
                  Terms of Service
                </Link>
                <Link href="/cookies" className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}>
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 