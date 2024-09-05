import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function MessagesContent() {
  return (
    <Card className="h-[calc(100vh-12rem)]">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>Your recent conversations with students and parents</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Messages content */}
      </CardContent>
      <CardFooter className="border-t bg-gray-50 dark:bg-gray-800">
        <Input placeholder="Type a message..." className="mr-2" />
        <Button>Send</Button>
      </CardFooter>
    </Card>
  )
}