'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiBook, FiHeadphones, FiFileText, FiLock, FiChrome, FiAward } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import logoSrc from './img/logo.png'

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TimelineProps {
  steps: Array<{ title: string; description: string }>;
}

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  highlighted?: boolean;
}

export default function LandingPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
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
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-2xl font-bold text-indigo-600">
              <Image src={logoSrc} alt="StudyLeaf Logo" width={64} height={64} className="mr-0" />
              <span>StudyLeaf</span>
            </Link>
            <ul className="hidden md:flex space-x-8">
              <li>
                <Link href="#features" className="text-gray-600 hover:text-indigo-600">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-gray-600 hover:text-indigo-600">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-gray-600 hover:text-indigo-600">
                  Pricing
                </Link>
              </li>
            </ul>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth?auth=login"
                className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-600 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/auth?auth=signup"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              Revolutionize Your Study Experience
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8"
            >
              Unlock your potential with AI-powered note-taking, personalized study materials, and collaborative learning.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link
                href="/auth?auth=signup"
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started for Free
              </Link>
            </motion.div>
          </div>
        </section>

        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
              Powerful Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<FiHeadphones className="w-8 h-8" />}
                title="Lecture-to-Notes"
                description="AI-powered note-taking that listens to your lectures and creates comprehensive notes in real-time."
              />
              <FeatureCard
                icon={<FiBook className="w-8 h-8" />}
                title="Personalized Study Material"
                description="Daily study materials tailored to your needs, based on your lectures, notes, and learning progress."
              />
              <FeatureCard
                icon={<FiFileText className="w-8 h-8" />}
                title="PDF Insights"
                description="Extract key information and generate audio summaries from your PDF study materials."
              />
              <FeatureCard
                icon={<FiLock className="w-8 h-8" />}
                title="Privacy Options"
                description="Choose to keep your generated content private or share it with the community."
              />
              <FeatureCard
                icon={<FiChrome className="w-8 h-8" />}
                title="Google Docs Extension"
                description="Enhance your note-taking in Google Docs with LaTeX conversion, smart autocorrect, and visual generation."
              />
              <FeatureCard
                icon={<FiAward className="w-8 h-8" />}
                title="Premium Features"
                description="Unlock advanced features and ad-free experience with our premium membership."
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 bg-gradient-to-br from-indigo-100 to-purple-100">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
            <div className="max-w-3xl mx-auto">
              <Timeline
                steps={[
                  { title: "Sign Up", description: "Create your free account and set up your profile." },
                  { title: "Connect Your Materials", description: "Upload your PDFs, link your Google Docs, or start a new notebook." },
                  { title: "Attend Lectures", description: "Use our AI to take notes during your lectures automatically." },
                  { title: "Personalized Study Plan", description: "Receive daily study materials based on your progress and needs." },
                  { title: "Collaborate and Learn", description: "Share your notes and learn from others in the community." },
                ]}
              />
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Choose the plan that best fits your needs
              </p>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-x-8">
              {/* Free Tier */}
              <div className="relative p-8 bg-white border-2 border-indigo-200 rounded-2xl shadow-sm flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Beta Access</h3>
                  <div className="absolute top-0 right-0 -translate-y-1/2 transform">
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                      Limited Time
                    </span>
                  </div>
                  <p className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-5xl font-extrabold tracking-tight">$0</span>
                    <span className="ml-1 text-xl font-semibold">/month</span>
                  </p>
                  <p className="mt-6 text-gray-500">
                    Early access to most features for a limited number of users
                  </p>

                  <ul className="mt-6 space-y-4">
                    <li className="flex items-center">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-gray-900">Create study sets</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-gray-900">Swipe to learn</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-gray-900">Basic AI quiz generation</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-gray-900">Limited PDF uploads</span>
                    </li>
                  </ul>
                </div>
                <Link href="/auth" 
                  className="mt-8 block w-full bg-indigo-600 text-center py-3 px-6 border border-transparent rounded-md text-white font-medium hover:bg-indigo-700">
                  Get Started
                </Link>
              </div>

              {/* Plus Tier */}
              <div className="relative p-8 bg-white border-2 border-indigo-500 rounded-2xl shadow-sm flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Plus</h3>
                  <div className="absolute top-0 right-0 -translate-y-1/2 transform">
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <p className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-5xl font-extrabold tracking-tight">$6.99</span>
                    <span className="ml-1 text-xl font-semibold">/month</span>
                  </p>

                  <ul className="mt-6 space-y-4">
                    <li className="flex items-center">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-gray-900">Everything in Free</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-gray-900">Advanced AI quiz generation</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-gray-900">Unlimited PDF uploads</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-gray-900">AI study recommendations</span>
                    </li>
                  </ul>
                </div>
                <Link href="/auth" 
                  className="mt-8 block w-full bg-indigo-600 text-center py-3 px-6 border border-transparent rounded-md text-white font-medium hover:bg-indigo-700">
                  Join Waitlist
                </Link>
              </div>

              {/* Pro Tier */}
              <div className="relative p-8 bg-white border-2 border-gray-200 rounded-2xl shadow-sm flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Pro</h3>
                  <div className="absolute top-0 right-0 -translate-y-1/2 transform">
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <p className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-5xl font-extrabold tracking-tight">$9.99</span>
                    <span className="ml-1 text-xl font-semibold">/month</span>
                  </p>

                  <ul className="mt-6 space-y-4">
                    <li className="flex items-center">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-gray-900">Everything in Plus</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-gray-900">AI lecture note generation</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-gray-900">Advanced analytics</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-gray-900">Priority support</span>
                    </li>
                  </ul>
                </div>
                <Link href="/auth" 
                  className="mt-8 block w-full bg-indigo-600 text-center py-3 px-6 border border-transparent rounded-md text-white font-medium hover:bg-indigo-700">
                  Join Waitlist
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-8">Ready to Transform Your Learning?</h2>
            <p className="text-xl mb-12">Join thousands of students who are already benefiting from our platform.</p>
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-indigo-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
            >
              Start Your Free Trial
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">StudyLeaf</h3>
              <p className="text-gray-400">Empowering students with AI-driven learning tools.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link href="#how-it-works" className="text-gray-400 hover:text-white">How It Works</Link></li>
                <li><Link href="#pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link href="/support" className="text-gray-400 hover:text-white">Support</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><Link href="https://twitter.com/StudyLeaf" className="text-gray-400 hover:text-white">Twitter</Link></li>
                <li><Link href="https://facebook.com/StudyLeaf" className="text-gray-400 hover:text-white">Facebook</Link></li>
                <li><Link href="https://linkedin.com/company/StudyLeaf" className="text-gray-400 hover:text-white">LinkedIn</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} StudyLeaf. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="text-indigo-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">
        {title}
      </h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  )
}

function Timeline({ steps }: TimelineProps) {
  return (
    <div className="relative">
      {steps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="mb-8 flex"
        >
          <div className="flex flex-col items-center mr-4">
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full">
              {index + 1}
            </div>
            {index < steps.length - 1 && <div className="w-px h-full bg-indigo-600 mt-2"></div>}
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              {step.title}
            </h3>
            <p className="text-gray-600">{step.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function PricingCard({ title, price, period, features, ctaText, ctaLink, highlighted = false }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white p-8 rounded-lg shadow-lg ${
        highlighted ? 'ring-2 ring-indigo-600' : ''
      }`}
    >
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold">{price}</span>
        {period && <span className="text-gray-600">/{period}</span>}
      </div>
      <ul className="mb-8 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={ctaLink}
        className={`block w-full py-2 px-4 text-center rounded ${
          highlighted
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        } transition-colors`}
      >
        {ctaText}
      </Link>
    </motion.div>
  )
}
