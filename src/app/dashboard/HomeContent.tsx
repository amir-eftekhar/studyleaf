import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star } from 'lucide-react'
import Image from 'next/image'

export default function HomeContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome back, John!</h2>
      <Tabs defaultValue="for-you" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="for-you">For You</TabsTrigger>
          <TabsTrigger value="find">Find</TabsTrigger>
        </TabsList>
        <TabsContent value="for-you">
          <div>
            {/* For You content */}
          </div>
        </TabsContent>
        <TabsContent value="find">
          <div>
            {/* Find content */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}