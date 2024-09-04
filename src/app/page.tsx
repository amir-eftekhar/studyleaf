'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, ChevronDown, Menu, Star, X, Book, Users, Rocket, Zap, Award, Globe } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">TutorConnect</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center" href="#features">
                <Book className="w-4 h-4 mr-1" />
                Features
              </Link>
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center" href="#how-it-works">
                <Rocket className="w-4 h-4 mr-1" />
                How It Works
              </Link>
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center" href="#benefits">
                <Zap className="w-4 h-4 mr-1" />
                Benefits
              </Link>
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center" href="#faq">
                <Users className="w-4 h-4 mr-1" />
                FAQ
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center">
              <Button variant="ghost" className="mr-6 text-base hover:bg-transparent focus:ring-0 md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X /> : <Menu />}
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </nav>
            <div className="hidden md:flex">
              <Link href="/auth">
                <Button variant="ghost" className="mr-2">Log in</Button>
              </Link>
              <Link href="/auth">
                <Button>Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="container flex h-14 items-center">
            <div className="flex flex-1 items-center justify-between">
              <Link className="flex items-center space-x-2" href="/">
                <span className="font-bold">TutorConnect</span>
              </Link>
              <Button variant="ghost" onClick={() => setIsMenuOpen(false)}>
                <X />
                <span className="sr-only">Close Menu</span>
              </Button>
            </div>
          </div>
          <nav className="container grid gap-y-4 pb-8 pt-4 text-lg">
            <Link className="hover:underline flex items-center" href="#features" onClick={() => setIsMenuOpen(false)}>
              <Book className="w-4 h-4 mr-2" />
              Features
            </Link>
            <Link className="hover:underline flex items-center" href="#how-it-works" onClick={() => setIsMenuOpen(false)}>
              <Rocket className="w-4 h-4 mr-2" />
              How It Works
            </Link>
            <Link className="hover:underline flex items-center" href="#benefits" onClick={() => setIsMenuOpen(false)}>
              <Zap className="w-4 h-4 mr-2" />
              Benefits
            </Link>
            <Link className="hover:underline flex items-center" href="#faq" onClick={() => setIsMenuOpen(false)}>
              <Users className="w-4 h-4 mr-2" />
              FAQ
            </Link>
            <Button className="w-full" variant="outline">Log in</Button>
            <Button className="w-full">Sign up</Button>
          </nav>
        </div>
      )}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-purple-600 to-pink-600">
          <motion.div
            className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            style={{ opacity, scale }}
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                  Connect, Learn, and Grow with TutorConnect
                </h1>
                <p className="mx-auto max-w-[700px] text-white md:text-xl">
                  The ultimate platform for tutors, parents, and students to find each other and create meaningful educational experiences.
                </p>
              </div>
              <div className="space-x-4">
                <Button className="bg-white text-purple-600 hover:bg-gray-100">Get Started</Button>
                <Button variant="outline" className="text-white border-white bg-purple-400 hover:bg-white/20">Learn More</Button>
              </div>
            </div>
          </motion.div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">Features</h2>
            <Tabs defaultValue="tutors" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="tutors">For Tutors</TabsTrigger>
                <TabsTrigger value="parents">For Parents</TabsTrigger>
                <TabsTrigger value="marketers">For Marketers</TabsTrigger>
              </TabsList>
              <TabsContent value="tutors">
                <div className="grid gap-6 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personalized Feed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Discover relevant opportunities and connect with students who match your expertise.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Calendar Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Easily manage your availability and schedule classes with integrated calendar tools.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Educational Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Access AI-powered tools to generate assignments and homework for your students.</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="parents">
                <div className="grid gap-6 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tutor Discovery</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Find the perfect tutor for your child based on subject, location, and teaching style.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Flexible Scheduling</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Set your preferred class times and easily coordinate with tutors.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Progress Tracking</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Monitor your childs progress and communicate directly with tutors.</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="marketers">
                <div className="grid gap-6 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Targeted Advertising</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Reach parents and students interested in your specific educational offerings.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Integrated Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Process registrations and payments directly through our platform.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Analytics Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Track the performance of your campaigns and optimize your marketing efforts.</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container  mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">How It Works</h2>
            <div className="grid gap-6 lg:grid-cols-3">
              <motion.div
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 rounded-full bg-primary p-4 text-primary-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Create Your Profile</h3>
                <p className="text-gray-500 dark:text-gray-400">Sign up and create a detailed profile showcasing your skills or requirements.</p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 rounded-full bg-primary p-4 text-primary-foreground">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Discover Opportunities</h3>
                <p className="text-gray-500 dark:text-gray-400">Browse through our personalized feed to find the perfect match.</p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 rounded-full bg-primary p-4 text-primary-foreground">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Connect and Learn</h3>
                <p className="text-gray-500 dark:text-gray-400">Schedule classes, manage payments, and start your educational journey.</p>
              </motion.div>
            </div>
          </div>
        </section>
        <section id="benefits" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">Benefits of TutorConnect</h2>
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Diverse Learning Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Access a wide range of subjects and skills, from academic topics to music, sports, and beyond.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Personalized Learning Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Find tutors who match your learning style and pace for a tailored educational journey.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Flexible Scheduling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Choose from in-person or online sessions to fit learning into your busy lifestyle.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Academic Excellence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Boost your childs academic performance with expert tutoring and personalized attention.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Safe and Secure Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Our verified tutor profiles and secure payment system ensure a safe learning environment.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Community and Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Join a thriving community of learners and educators, with support available when you need it.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">What Our Users Say</h2>
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Amazing Platform!</CardTitle>
                  <CardDescription>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                      ))}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>TutorConnect has transformed how I find and connect with students. Its user-friendly and efficient!</p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center">
                    <Avatar className="w-10 h-10">
                      <AvatarImage alt="Sarah Johnson" src="/placeholder-avatar.jpg" />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="text-sm font-medium">Sarah Johnson</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Math Tutor</p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Found the Perfect Tutor</CardTitle>
                  <CardDescription>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                      ))}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>As a parent, I was able to quickly find a great science tutor for my daughter. Highly recommended!</p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center">
                    <Avatar className="w-10 h-10">
                      <AvatarImage alt="Michael Lee" src="/placeholder-avatar-2.jpg" />
                      <AvatarFallback>ML</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="text-sm font-medium">Michael Lee</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Parent</p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Great for Marketing</CardTitle>
                  <CardDescription>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                      ))}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>TutorConnect has been instrumental in growing our music school. The targeted advertising is spot-on!</p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center">
                    <Avatar className="w-10 h-10">
                      <AvatarImage alt="Emily Chen" src="/placeholder-avatar-3.jpg" />
                      <AvatarFallback>EC</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="text-sm font-medium">Emily Chen</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Music School Owner</p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I sign up as a tutor?</AccordionTrigger>
                <AccordionContent>
                  To sign up as a tutor, click the Sign Up button and select the Tutor option. Fill out your profile with your qualifications, subjects you teach, and availability.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How does payment work?</AccordionTrigger>
                <AccordionContent>
                  Payments are processed securely through our platform. Tutors set their rates, and students pay through the app. We handle the transfer of funds to tutors after each completed session.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I use TutorConnect for online classes?</AccordionTrigger>
                <AccordionContent>
                  Yes! TutorConnect supports both in-person and online tutoring sessions. You can specify your preference in your profile settings.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>What subjects are available on TutorConnect?</AccordionTrigger>
                <AccordionContent>
                  TutorConnect supports a wide range of subjects, from academic topics like math and science to music lessons, language learning, and more. If you dont see your subject listed, you can add it to your profile.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>How can I market my classes on TutorConnect?</AccordionTrigger>
                <AccordionContent>
                  As a tutor or educational institution, you can create sponsored posts to promote your classes. Our platform offers targeted advertising options to reach potential students in your area or subject niche.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center text-white">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Transform Your Tutoring Experience?</h2>
                <p className="mx-auto max-w-[700px] text-white/90 md:text-xl">
                  Join TutorConnect today and unlock a world of educational opportunities.
                </p>
              </div>
              <div className="space-x-4">
                <Button className="bg-white text-purple-600 hover:bg-gray-100">Get Started Now</Button>
                <Button variant="outline" className="text-white border-white bg-purple-400 hover:bg-white/20">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2023 TutorConnect. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}