'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useTheme } from 'next-themes'
import MainLayout from '@/components/layout/MainLayout'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { FiPlus, FiCalendar, FiClock, FiBook } from 'react-icons/fi'

interface StudyEvent {
  _id: string
  title: string
  start: string
  end: string
  description: string
  studySetId?: string
  color?: string
  allDay?: boolean
}

export default function SchedulePage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [events, setEvents] = useState<StudyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<StudyEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    studySetId: '',
    allDay: false
  })
  const [studySets, setStudySets] = useState<any[]>([])

  useEffect(() => {
    fetchEvents()
    fetchStudySets()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/schedule')
      setEvents(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching events:', error)
      setLoading(false)
    }
  }

  const fetchStudySets = async () => {
    try {
      const response = await axios.get('/api/study-sets')
      setStudySets(response.data)
    } catch (error) {
      console.error('Error fetching study sets:', error)
    }
  }

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start)
    setNewEvent({
      ...newEvent,
      start: selectInfo.startStr,
      end: selectInfo.endStr
    })
    setShowEventModal(true)
  }

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent({
      _id: clickInfo.event.id,
      title: clickInfo.event.title,
      description: clickInfo.event.extendedProps.description || '',
      start: clickInfo.event.start.toISOString(),
      end: clickInfo.event.end.toISOString(),
      studySetId: clickInfo.event.extendedProps.studySetId,
      color: clickInfo.event.backgroundColor,
      allDay: clickInfo.event.allDay
    })
    setShowEventDetails(true)
  }

  const handleCreateEvent = async () => {
    try {
      const response = await axios.post('/api/schedule', newEvent)
      setEvents([...events, response.data])
      setShowEventModal(false)
      setNewEvent({
        title: '',
        description: '',
        start: '',
        end: '',
        studySetId: '',
        allDay: false
      })
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await axios.delete('/api/schedule', { data: { eventId } })
      setEvents(events.filter(event => event._id !== eventId))
      setShowEventDetails(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 bg-gradient-to-r ${
              isDark 
                ? 'from-indigo-400 to-indigo-600' 
                : 'from-indigo-500 to-indigo-700'
            } bg-clip-text text-transparent`}>
              Study Schedule
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Plan and organize your study sessions
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowEventModal(true)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              isDark 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            <FiPlus size={20} />
            <span>Add Study Session</span>
          </motion.button>
        </div>

        <div className={`rounded-xl border p-4 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={events}
            select={handleDateSelect}
            eventClick={handleEventClick}
            height="auto"
            className={isDark ? 'fc-dark' : ''}
          />
        </div>

        {/* Create Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`w-full max-w-md mx-4 p-6 rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Create Study Session
              </h2>
              
              <input
                type="text"
                placeholder="Session Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className={`w-full p-2 mb-4 rounded-lg ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-100 text-gray-900 border-gray-200'
                } border`}
              />

              <textarea
                placeholder="Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className={`w-full p-2 mb-4 rounded-lg ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-100 text-gray-900 border-gray-200'
                } border`}
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block mb-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.start}
                    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                    className={`w-full p-2 rounded-lg ${
                      isDark 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-gray-100 text-gray-900 border-gray-200'
                    } border`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                    className={`w-full p-2 rounded-lg ${
                      isDark 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-gray-100 text-gray-900 border-gray-200'
                    } border`}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className={`block mb-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Study Set (Optional)
                </label>
                <select
                  value={newEvent.studySetId}
                  onChange={(e) => setNewEvent({ ...newEvent, studySetId: e.target.value })}
                  className={`w-full p-2 rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-gray-100 text-gray-900 border-gray-200'
                  } border`}
                >
                  <option value="">Select a study set</option>
                  {studySets.map((set) => (
                    <option key={set._id} value={set._id}>
                      {set.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEventModal(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  Create Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {showEventDetails && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`w-full max-w-md mx-4 p-6 rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedEvent.title}
                </h2>
                <button
                  onClick={() => setShowEventDetails(false)}
                  className={`text-2xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  ×
                </button>
              </div>
              
              <div className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-center mb-2">
                  <FiCalendar className="mr-2" />
                  <span>
                    {new Date(selectedEvent.start).toLocaleDateString()} - {new Date(selectedEvent.end).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  <FiClock className="mr-2" />
                  <span>
                    {new Date(selectedEvent.start).toLocaleTimeString()} - {new Date(selectedEvent.end).toLocaleTimeString()}
                  </span>
                </div>
                {selectedEvent.studySetId && (
                  <div className="flex items-center mb-2">
                    <FiBook className="mr-2" />
                    <span>
                      {studySets.find(set => set._id === selectedEvent.studySetId)?.title || 'Study Set'}
                    </span>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <div className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p>{selectedEvent.description}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleDeleteEvent(selectedEvent._id)}
                  className={`px-4 py-2 rounded-lg ${
                    isDark 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white`}
                >
                  Delete Session
                </button>
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
