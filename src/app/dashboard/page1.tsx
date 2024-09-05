'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Home, User, MessageSquare, Calendar as CalendarIcon, Users, CreditCard, Menu, X, Search, Bell, Settings, ChevronRight, ChevronLeft, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
              <Input type="search" placeholder="Search..." className="max-w-sm" />
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

function HomeContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome back, John!</h2>
      <Tabs defaultValue="for-you" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="for-you">For You</TabsTrigger>
          <TabsTrigger value="find">Find</TabsTrigger>
        </TabsList>
        <TabsContent value="for-you">
          <div className="grid gap-6">
            {[
              {
                type: 'class-request',
                user: 'Emily Chen',
                subject: 'Math Tutoring',
                description: 'Looking for a math tutor for my 10th-grade daughter. Algebra and geometry focus.',
                location: 'San Francisco, CA',
                image: 'https://images.unsplash.com/photo-1509869175650-a1d97972541a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
              },
              {
                type: 'tutor-post',
                user: 'David Lee',
                subject: 'Physics Made Easy',
                description: 'Offering engaging physics lessons for high school students. Specializing in mechanics and electromagnetism.',
                availability: 'Weekday evenings and weekends',
                image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
              },
              {
                type: 'class-offer',
                user: 'Sarah Williams',
                subject: 'Creative Writing Workshop',
                description: 'Join our small group creative writing sessions. Perfect for aspiring young authors!',
                schedule: 'Every Saturday, 2-4 PM',
                image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
              },
            ].map((post, index) => (
              <Card key={index} className="overflow-hidden transition-shadow hover:shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-500 text-white p-4">
                  <CardTitle>{post.subject}</CardTitle>
                  <CardDescription className="text-purple-100">{post.type === 'class-request' ? 'Class Request' : post.type === 'tutor-post' ? 'Tutor Post' : 'Class Offer'}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Image src={post.image} alt={post.subject} width={800} height={400} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar>
                        <AvatarImage src={`/placeholder-avatar-${index + 1}.jpg`} alt={post.user} />
                        <AvatarFallback>{post.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{post.user}</p>
                        <p className="text-sm text-gray-500">{post.location || post.availability || post.schedule}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{post.description}</p>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-800 flex justify-between p-4">
                  <Button variant="outline">View Profile</Button>
                  <Button>Message</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="find">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Alex Johnson', subject: 'Mathematics', rating: 4.9, price: '$40/hour', image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
              { name: 'Sophia Lee', subject: 'Physics', rating: 4.8, price: '$45/hour', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
              { name: 'Michael Brown', subject: 'Chemistry', rating: 4.7, price: '$38/hour', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
              { name: 'Emma Davis', subject: 'Biology', rating: 4.9, price: '$42/hour', image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
              { name: 'Daniel Wilson', subject: 'Computer Science', rating: 4.8, price: '$50/hour', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
              { name: 'Olivia Taylor', subject: 'English Literature', rating: 4.9, price: '$35/hour', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
            ].map((tutor, index) => (
              <Card key={index} className="overflow-hidden transition-transform hover:scale-105">
                <CardHeader className="p-0">
                  <Image src={tutor.image} alt={tutor.name} width={400} height={300} className="w-full h-48 object-cover" />
                </CardHeader>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{tutor.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{tutor.subject} Tutor</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-2 font-semibold">{tutor.rating}</span>
                    </div>
                    <Badge variant="secondary">{tutor.price}</Badge>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-800 flex justify-between p-4">
                  <Button variant="outline">View Profile</Button>
                  <Button>Book Session</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProfileContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>Manage your personal information and tutoring preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Profile Picture" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">John Doe</h3>
              <p className="text-sm text-muted-foreground">Math & Physics Tutor</p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Bio</h4>
            <p className="text-sm text-muted-foreground">
              Passionate educator with 5+ years of experience in teaching Mathematics and Physics to high school and college students.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Subjects</h4>
            <div className="flex flex-wrap gap-2">
              <Badge>Mathematics</Badge>
              <Badge>Physics</Badge>
              <Badge>Calculus</Badge>
              <Badge>Algebra</Badge>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Education</h4>
            <p className="text-sm">M.Sc. in Applied Mathematics, University of Science</p>
            <p className="text-sm">B.Sc. in Physics, Tech Institute</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Edit Profile</Button>
      </CardFooter>
    </Card>
  )
}

function MessagesContent() {
  return (
    <Card className="h-[calc(100vh-12rem)]">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>Your recent conversations with students and parents</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-20rem)]">
          <div className="space-y-4">
            {[
              { name: 'Emily Chen', message: 'Hi, I have a question about the upcoming Physics test.', time: '10:23 AM', unread: true },
              { name: 'Michael Johnson', message: 'Thanks for the great Math session yesterday!', time: 'Yesterday', unread: false },
              { name: 'Sarah Williams', message: 'Can we reschedule our Calculus tutoring for next week?', time: '2 days ago', unread: false },
              { name: 'David Lee', message: "I'm having trouble with the homework you assigned. Can you help?", time: '3 days ago', unread: false },
              { name: 'Lisa Taylor', message: "My daughter really enjoyed your Algebra class. We'd like to book more sessions.", time: '1 week ago', unread: false },
            ].map((msg, index) => (
              <div key={index} className={`flex items-start space-x-4 p-3 rounded-lg transition-colors ${msg.unread ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <Avatar>
                  <AvatarImage src={`/placeholder-avatar-${index + 1}.jpg`} alt={msg.name} />
                  <AvatarFallback>{msg.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">{msg.name}</h4>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{msg.message}</p>
                </div>
                {msg.unread && <Badge className="bg-blue-500">New</Badge>}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t bg-gray-50 dark:bg-gray-800">
        <Input placeholder="Type a message..." className="mr-2" />
        <Button>Send</Button>
      </CardFooter>
    </Card>
  )
}

function CalendarContent() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Schedule</CardTitle>
          <CardDescription>Manage your tutoring sessions and availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {[
                    { student: 'Emily Chen', subject: 'Physics', time: '3:00 PM - 4:00 PM' },
                    { student: 'Michael Johnson', subject: 'Calculus', time: '5:00 PM - 6:30 PM' },
                    { student: 'Sarah Williams', subject: 'Algebra', time: '7:00 PM - 8:00 PM' },
                  ].map((session, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{session.student}</h4>
                            <p className="text-sm text-muted-foreground">{session.subject}</p>
                          </div>
                          <Badge variant="outline">{session.time}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Set Availability</Button>
          <Button>Schedule Session</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function MatchContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Matches</CardTitle>
          <CardDescription>Students who match your tutoring profile</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {[
                { name: 'Alex Johnson', subject: 'Physics', grade: '11th', compatibility: '95%' },
                { name: 'Sophia Lee', subject: 'Calculus', grade: '12th', compatibility: '90%' },
                { name: 'Ethan Brown', subject: 'Algebra', grade: '9th', compatibility: '88%' },
                { name: 'Olivia Davis', subject: 'Mathematics', grade: '10th', compatibility: '85%' },
                { name: 'Daniel Wilson', subject: 'Physics', grade: '12th', compatibility: '82%' },
              ].map((student, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={`/placeholder-avatar-${index + 1}.jpg`} alt={student.name} />
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-semibold">{student.name}</h4>
                      <p className="text-sm text-muted-foreground">{student.subject} - Grade {student.grade}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">{student.compatibility} Match</Badge>
                    <Button size="sm">Connect</Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Match Preferences</CardTitle>
          <CardDescription>Customize your matching criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Preferred Subjects</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-500">Mathematics</Badge>
                <Badge className="bg-green-500">Physics</Badge>
                <Badge className="bg-purple-500">Calculus</Badge>
                <Badge variant="outline">+ Add Subject</Badge>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Grade Levels</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-yellow-500">High School</Badge>
                <Badge className="bg-orange-500">College</Badge>
                <Badge variant="outline">+ Add Level</Badge>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Teaching Style</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-pink-500">One-on-One</Badge>
                <Badge className="bg-indigo-500">Small Groups</Badge>
                <Badge variant="outline">+ Add Style</Badge>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Update Preferences</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function PaymentsContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
          <CardDescription>Your earnings and upcoming payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Earnings (This Month)</span>
              <span className="text-2xl font-bold text-green-600">$1,250.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Pending Payments</span>
              <span className="text-lg font-semibold text-orange-500">$350.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Next Payout Date</span>
              <span className="text-sm">July 15, 2023</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {[
                { student: 'Emily Chen', amount: '$75.00', date: 'July 5, 2023', status: 'Completed' },
                { student: 'Michael Johnson', amount: '$100.00', date: 'July 3, 2023', status: 'Completed' },
                { student: 'Sarah Williams', amount: '$90.00', date: 'July 1, 2023', status: 'Completed' },
                { student: 'David Lee', amount: '$60.00', date: 'June 28, 2023', status: 'Completed' },
                { student: 'Lisa Taylor', amount: '$120.00', date: 'June 25, 2023', status: 'Completed' },
              ].map((transaction, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div>
                    <h4 className="text-sm font-semibold">{transaction.student}</h4>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{transaction.amount}</p>
                    <Badge variant="outline" className="bg-green-100 text-green-800">{transaction.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="flex items-center space-x-4">
                <CreditCard className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/2024</p>
                </div>
              </div>
              <Badge>Default</Badge>
            </div>
            <Button variant="outline" className="w-full">Add Payment Method</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="First Name" />
              <Input placeholder="Last Name" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Phone Number" type="tel" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Password</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Current Password" type="password" />
              <Input placeholder="New Password" type="password" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="email-notifications" className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50" />
              <label htmlFor="email-notifications">Receive email notifications</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="sms-notifications" className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50" />
              <label htmlFor="sms-notifications">Receive SMS notifications</label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>Control your privacy and data sharing preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Make profile visible to other users</span>
            <input type="checkbox" className="toggle toggle-primary" />
          </div>
          <div className="flex items-center justify-between">
            <span>Allow messages from non-connections</span>
            <input type="checkbox" className="toggle toggle-primary" />
          </div>
          <div className="flex items-center justify-between">
            <span>Share activity status</span>
            <input type="checkbox" className="toggle toggle-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}