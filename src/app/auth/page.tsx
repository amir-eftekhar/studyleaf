'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function SignUpLogin() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const router = useRouter()
  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')


  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries())
  
    console.log('Sending data:', data); // Log the data being sent
  
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'signup', 
          usertype: role,
          name: data.name,
          phone: data.phone,
          email: data.email,
          password: data.password
        }),
      })
  
      if (response.ok) {
        router.push('/dashboard')
      } else {
        const error = await response.json()
        alert(error.error + (error.details ? ': ' + error.details.join(', ') : ''))
      }
    } catch (error) {
      console.error('An error occurred:', error)
    }
  }
 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  console.log('Sending login data:', { email: loginEmail, password: loginPassword, action: 'login' })
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'login', 
        email: loginEmail,
        password: loginPassword
      }),
    })

    const result = await response.json()

    if (response.ok) {
      localStorage.setItem('authToken', result.token)
      router.push('/dashboard')
    } else {
      console.error('Login failed:', result)
      alert(result.error || 'Login failed')
    }
  } catch (error) {
    console.error('An error occurred during login:', error)
    alert('An error occurred during login')
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 p-4">
      <motion.div
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
          </TabsList>
          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              {step === 1 && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl font-bold mb-4">Choose Your Role</h2>
                  <RadioGroup onValueChange={setRole} className="mb-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tutor" id="tutor" />
                      <Label htmlFor="tutor">Tutor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advertiser" id="advertiser" />
                      <Label htmlFor="advertiser">Advertiser</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="parent" id="parent" />
                      <Label htmlFor="parent">Parent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student">Student</Label>
                    </div>
                  </RadioGroup>
                  <Button onClick={nextStep} disabled={!role} className="w-full">
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 123-4567" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="johndoe@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" placeholder="••••••••••" type="password" required />
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <Button onClick={prevStep} variant="outline">
                      <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button type="submit">Sign Up</Button>
                  </div>
                </motion.div>
              )}
            </form>
          </TabsContent>
          <TabsContent value="login">
    <motion.form onSubmit={handleLogin}>
      <h2 className="text-2xl font-bold mb-4">Welcome Back</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input 
            id="login-email" 
            type="email" 
            placeholder="johndoe@example.com" 
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">Password</Label>
          <Input 
            id="login-password" 
            type="password" 
            placeholder="••••••••••" 
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required 
          />
        </div>
      </div>
      <Button type="submit" className="w-full mt-6">Log In</Button>
    </motion.form>
  </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}