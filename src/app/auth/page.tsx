"use client"

import { useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function Component() {
  const signInRef = useRef(null)
  const signUpRef = useRef(null)
  const pricingRef = useRef(null)
  const handleSignInClick = () => {
    signInRef.current.scrollIntoView({ behavior: "smooth" })
  }
  const handleSignUpClick = () => {
    signUpRef.current.scrollIntoView({ behavior: "smooth" })
  }
  const handlePricingClick = () => {
    pricingRef.current.scrollIntoView({ behavior: "smooth" })
  }
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-2 font-bold text-xl" prefetch={false}>
          <BookIcon className="h-6 w-6" />
          EduPlatform
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <Link href="#" className="hover:underline" prefetch={false}>
            Features
          </Link>
          <Button variant="outline" onClick={handlePricingClick}>
            Pricing
          </Button>
          <Link href="#" className="hover:underline" prefetch={false}>
            About
          </Link>
          <Link href="#" className="hover:underline" prefetch={false}>
            Contact
          </Link>
          <Button variant="secondary" onClick={handleSignInClick}>
            Sign In
          </Button>
          <Button onClick={handleSignUpClick}>Sign Up</Button>
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
      </header>
      <main className="flex-1">
        <section className="bg-primary py-12 md:py-24 lg:py-32 text-primary-foreground">
          <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Unlock Your Learning Potential</h1>
              <p className="text-lg md:text-xl">
                EduPlatform is your comprehensive educational companion, packed with powerful tools to enhance your
                studying experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="lg" onClick={handleSignUpClick}>
                  Get Started
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="/placeholder.svg"
                width={600}
                height={400}
                alt="EduPlatform Hero"
                className="rounded-lg"
                style={{ aspectRatio: "600/400", objectFit: "cover" }}
              />
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src="/placeholder.svg"
                width={600}
                height={400}
                alt="Lecture-to-Notes"
                className="rounded-lg"
                style={{ aspectRatio: "600/400", objectFit: "cover" }}
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Lecture-to-Notes</h2>
              <p className="text-lg md:text-xl">
                Our AI-powered feature listens to your lectures and automatically generates detailed notes, so you can
                focus on learning.
              </p>
              <Button size="lg">Learn More</Button>
            </div>
          </div>
        </section>
        <section className="bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Personalized Study Material</h2>
              <p className="text-lg md:text-xl">
                EduPlatform analyzes your study materials, lectures, and areas of struggle to curate daily content
                tailored to your needs.
              </p>
              <Button size="lg">Explore Now</Button>
            </div>
            <div>
              <img
                src="/placeholder.svg"
                width={600}
                height={400}
                alt="Personalized Study Material"
                className="rounded-lg"
                style={{ aspectRatio: "600/400", objectFit: "cover" }}
              />
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src="/placeholder.svg"
                width={600}
                height={400}
                alt="PDF Insights"
                className="rounded-lg"
                style={{ aspectRatio: "600/400", objectFit: "cover" }}
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">PDF Insights</h2>
              <p className="text-lg md:text-xl">
                Upload PDFs and let EduPlatform provide you with audio summaries or key insights from the content.
              </p>
              <Button size="lg">Try it Now</Button>
            </div>
          </div>
        </section>
        <section className="bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Content Sharing</h2>
              <p className="text-lg md:text-xl">
                Share your user-generated content publicly and discover valuable resources created by others.
              </p>
              <Button size="lg">Explore Library</Button>
            </div>
            <div>
              <img
                src="/placeholder.svg"
                width={600}
                height={400}
                alt="Content Sharing"
                className="rounded-lg"
                style={{ aspectRatio: "600/400", objectFit: "cover" }}
              />
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src="/placeholder.svg"
                width={600}
                height={400}
                alt="Premium Privacy"
                className="rounded-lg"
                style={{ aspectRatio: "600/400", objectFit: "cover" }}
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Premium Privacy</h2>
              <p className="text-lg md:text-xl">
                Upgrade to a premium account and keep your generated content private, ensuring your learning journey
                remains secure.
              </p>
              <Button size="lg">Upgrade Now</Button>
            </div>
          </div>
        </section>
        <section className="bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Google Docs Integration</h2>
              <p className="text-lg md:text-xl">
                Our browser extension seamlessly integrates with Google Docs, allowing you to convert natural language
                to LaTeX and receive live, accurate formatting assistance.
              </p>
              <Button size="lg">Install Extension</Button>
            </div>
            <div>
              <img
                src="/placeholder.svg"
                width={600}
                height={400}
                alt="Google Docs Integration"
                className="rounded-lg"
                style={{ aspectRatio: "600/400", objectFit: "cover" }}
              />
            </div>
          </div>
        </section>
        <section className="bg-muted py-12 md:py-24 lg:py-32" ref={pricingRef}>
          <div className="container px-4 md:px-6 grid gap-8 items-center">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Pricing</h2>
              <p className="text-lg md:text-xl">Choose the plan that fits your needs.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>Get started with our basic features.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      <span>Lecture-to-Notes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      <span>Personalized Study Material</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      <span>PDF Insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XIcon className="w-5 h-5 text-red-500" />
                      <span>Content Sharing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XIcon className="w-5 h-5 text-red-500" />
                      <span>Premium Privacy</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Sign Up</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>Get access to all features.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      <span>Lecture-to-Notes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      <span>Personalized Study Material</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      <span>PDF Insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      <span>Content Sharing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      <span>Premium Privacy</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Subscribe - $20/month</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Medium</CardTitle>
                  <CardDescription>Get access to most features.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      <span>Lecture-to-Notes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      <span>Personalized Study Material</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      <span>PDF Insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XIcon className="w-5 h-5 text-red-500" />
                      <span>Content Sharing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XIcon className="w-5 h-5 text-red-500" />
                      <span>Premium Privacy</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Subscribe - $10/month</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <section className="bg-muted py-12 md:py-24 lg:py-32" ref={signInRef}>
        <div className="container px-4 md:px-6 grid gap-8 items-center">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Sign In</h2>
            <p className="text-lg md:text-xl">Enter your credentials to access your account.</p>
          </div>
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" />
                  </div>
                  <Button className="w-full">Sign In</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="bg-muted py-12 md:py-24 lg:py-32" ref={signUpRef}>
        <div className="container px-4 md:px-6 grid gap-8 items-center">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:" />
          </div>
        </div>
      </section>
    </div>
  )
}

function BookIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}


function CheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}


function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}


function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
