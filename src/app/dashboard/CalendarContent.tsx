'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 9 }, (_, i) => i + 13) // 13:00 to 21:00

const DAY_COLORS = [
  'bg-red-100',
  'bg-blue-100',
  'bg-green-100',
  'bg-yellow-100',
  'bg-purple-100',
  'bg-pink-100',
  'bg-indigo-100',
]

function CustomCalendar() {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const toggleSlot = (day: string, hour: number) => {
    const slotKey = `${day}-${hour}`
    setSelectedSlots(prev => 
      prev.includes(slotKey) 
        ? prev.filter(slot => slot !== slotKey)
        : [...prev, slotKey]
    )
  }

  const getWeekDates = (startDate: Date) => {
    const week = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      week.push(date)
    }
    return week
  }

  const weekDates = getWeekDates(currentWeek)

  const changeWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newDate)
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Weekly Schedule</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={() => changeWeek('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => changeWeek('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 gap-2">
          <div className="sticky top-0 bg-background z-10"></div>
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={day} className={`sticky top-0 bg-background z-10 text-center font-semibold py-2 rounded-t-lg ${DAY_COLORS[index]}`}>
              <div>{day}</div>
              <div className="text-sm text-muted-foreground">
                {weekDates[index].getDate()}
              </div>
            </div>
          ))}
          {HOURS.map(hour => (
            <React.Fragment key={hour}>
              <div className="text-right pr-2 py-2 text-sm text-muted-foreground">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {DAYS_OF_WEEK.map((day, index) => {
                const isSelected = selectedSlots.includes(`${day}-${hour}`)
                return (
                  <button
                    key={`${day}-${hour}`}
                    className={`border border-border hover:bg-accent hover:border-accent transition-colors rounded-md ${
                      isSelected ? 'bg-primary border-primary' : DAY_COLORS[index]
                    }`}
                    onClick={() => toggleSlot(day, hour)}
                    aria-label={`Select ${day} at ${hour}:00`}
                  />
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CalendarPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Your Schedule</h1>
      <p className="text-muted-foreground">Manage your tutoring sessions and availability</p>
      <CustomCalendar />
      <div className="flex flex-col sm:flex-row justify-between mt-6 space-y-4 sm:space-y-0 sm:space-x-4">
        <Button variant="outline" className="w-full sm:w-auto">Set Availability</Button>
        <Button className="w-full sm:w-auto">Schedule Session</Button>
      </div>
    </div>
  )
}
