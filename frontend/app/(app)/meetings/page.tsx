"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarIcon, Clock, Video, Star, Search, X, Maximize2 } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { FeedbackModal } from "@/components/modals/feedback-modal"
import { useAuth } from "@/components/auth-provider"

/* ------------------------------------------------------------------ */
/*  Whereby logo inline SVG (no external dependency)                   */
/* ------------------------------------------------------------------ */
function WherebyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 7.5-4.5 4.5-4.5-4.5 1.5-1.5L12 11l3-3 1.5 1.5z"/>
    </svg>
  )
}

function MeetingsContent() {
  const searchParams = useSearchParams()
  const connectionToken = searchParams.get("token")
  const { user } = useAuth()

  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Feedback modal state
  const [feedbackMeeting, setFeedbackMeeting] = useState<any>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  // Scheduling state
  const [isScheduling, setIsScheduling] = useState(!!connectionToken)
  const [date, setDate] = useState<Date>()
  const [hour, setHour] = useState("10")
  const [minute, setMinute] = useState("00")
  const [period, setPeriod] = useState("AM")
  const [scheduleLoading, setScheduleLoading] = useState(false)

  // Whereby inline embed state
  const [activeRoom, setActiveRoom] = useState<{ url: string; hostUrl?: string; isHost: boolean } | null>(null)
  const [activeMeeting, setActiveMeeting] = useState<any>(null)
  const [embedExpanded, setEmbedExpanded] = useState(false)

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      const res = await fetch(`/api/meetings${connectionToken ? `?connectionToken=${connectionToken}` : ''}`)
      const data = await res.json()
      if (res.ok) {
        setMeetings(data.meetings || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = async () => {
    if (!date || scheduleLoading || !connectionToken) return

    setScheduleLoading(true)
    try {
      let h = parseInt(hour)
      if (period === "PM" && h < 12) h += 12
      if (period === "AM" && h === 12) h = 0

      const startTime = new Date(date)
      startTime.setHours(h, parseInt(minute), 0, 0)

      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionToken,
          startTime: startTime.toISOString(),
          durationMinutes: 40,
        })
      })

      if (res.ok) {
        setIsScheduling(false)
        fetchMeetings()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to schedule meeting")
    } finally {
      setScheduleLoading(false)
    }
  }

  const handleJoinMeeting = (meeting: any) => {
    // Determine if the current user is the organizer
    const isOrganizer = meeting.organizerId?._id === user?._id || meeting.organizerId === user?._id
    const roomUrl = meeting.meetLink
    const hostUrl = meeting.hostMeetLink

    setActiveMeeting(meeting)
    setActiveRoom({
      url: roomUrl,
      hostUrl: hostUrl || undefined,
      isHost: isOrganizer && !!hostUrl,
    })
    setEmbedExpanded(false)
    // Scroll to the embed
    setTimeout(() => {
      document.getElementById("whereby-embed-section")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  const handleCloseRoom = async () => {
    setActiveRoom(null)
    setEmbedExpanded(false)
    if (activeMeeting) {
      // Mark the meeting status as COMPLETED immediately
      try {
        await fetch("/api/meetings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meetingId: activeMeeting._id,
            status: "COMPLETED"
          })
        })
      } catch (err) {
        console.error("Failed to mark meeting as COMPLETED:", err)
      }

      setFeedbackMeeting(activeMeeting)
      setFeedbackOpen(true)
      setActiveMeeting(null)
    }
  }

  const filteredMeetings = meetings.filter(m => {
    const searchString = search.toLowerCase()
    return (
      m.connectionId?.userABizName?.toLowerCase().includes(searchString) ||
      m.connectionId?.userBBizName?.toLowerCase().includes(searchString) ||
      m.organizerId?.name?.toLowerCase().includes(searchString) ||
      m.attendeeId?.name?.toLowerCase().includes(searchString)
    )
  })

  const embedUrl = activeRoom
    ? activeRoom.isHost && activeRoom.hostUrl
      ? activeRoom.hostUrl
      : activeRoom.url
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight italic mb-1">Meetings</h1>
          <p className="text-slate-500 dark:text-white/40 font-medium text-xs uppercase tracking-widest font-black">Manage your deal-making schedule</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
           {connectionToken && !isScheduling && (
             <Button onClick={() => setIsScheduling(true)} className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-2xl shadow-lg shadow-primary/20">
               Schedule New
             </Button>
           )}
           <div className="relative flex-grow sm:flex-grow-0 sm:w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search meetings..." 
                className="pl-11 h-11 bg-slate-100 dark:bg-white/5 border-none rounded-2xl font-bold text-sm w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>
      </div>

      {/* Schedule Form */}
      {isScheduling && connectionToken && (
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black tracking-tight italic">Schedule Meeting</h2>
            <Button variant="ghost" onClick={() => setIsScheduling(false)} className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cancel</Button>
          </div>

          <div className="space-y-6">
            {/* Whereby branding badge */}
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary bg-primary/10 w-fit px-3 py-1.5 rounded-lg mb-4">
              <Video className="h-4 w-4" /> Powered by Whereby · 40-min room
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Select Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-xl h-11 border-slate-200 dark:border-white/10",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Select Start Time</label>
                <div className="flex flex-wrap gap-2">
                  <select 
                    className="h-11 w-20 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 text-sm font-bold text-slate-900 dark:text-white"
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                  >
                    {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => (
                      <option key={h} value={h} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{h}</option>
                    ))}
                  </select>
                  <select 
                    className="h-11 w-20 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 text-sm font-bold text-slate-900 dark:text-white"
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                  >
                    {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                      <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{m}</option>
                    ))}
                  </select>
                  <select 
                    className="h-11 w-20 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 text-sm font-bold text-slate-900 dark:text-white"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option value="AM" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">AM</option>
                    <option value="PM" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">PM</option>
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Room duration: 40 minutes</p>
              </div>
            </div>
            <Button 
              onClick={handleSchedule} 
              disabled={!date || scheduleLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[11px] h-12 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              {scheduleLoading ? "Creating Room..." : "Schedule Meeting & Create Whereby Room"}
            </Button>
          </div>
        </div>
      )}

      {/* Whereby Inline Embed */}
      {activeRoom && embedUrl && (
        <div
          id="whereby-embed-section"
          className={cn(
            "bg-black rounded-2xl overflow-hidden border border-white/10 transition-all duration-300",
            embedExpanded ? "fixed inset-4 z-50 rounded-2xl" : "relative"
          )}
        >
          {/* Embed header bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0A0A0A] border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-white/70">
                {activeRoom.isHost ? "Whereby · Host View" : "Whereby · Participant View"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/10 rounded-xl"
                onClick={() => setEmbedExpanded(prev => !prev)}
                title={embedExpanded ? "Exit fullscreen" : "Expand"}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-xl"
                onClick={handleCloseRoom}
                title="Close room"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Whereby iframe */}
          <iframe
            src={embedUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay; speaker-selection"
            className={cn(
              "w-full border-none block transition-all duration-300",
              embedExpanded 
                ? "h-[calc(100vh-120px)]" 
                : "h-[380px] xs:h-[440px] md:h-[600px]"
            )}
            title="Whereby Meeting Room"
          />
        </div>
      )}

      {/* Meeting Cards */}
      {!loading && filteredMeetings.length > 0 && (
        <div className="grid gap-4">
           {filteredMeetings.map((m) => {
             const isOrganizer = m.organizerId?._id === user?._id || m.organizerId === user?._id
             const isActiveRoom = activeRoom?.url === m.meetLink

             return (
               <div
                 key={m._id}
                 className={cn(
                   "p-5 md:p-8 rounded-2xl bg-white dark:bg-[#0A0A0A] border transition-all duration-300",
                   isActiveRoom
                     ? "border-primary/40 shadow-lg shadow-primary/10"
                     : "border-slate-200 dark:border-white/5 hover:border-primary/20 group"
                 )}
               >
                  
                  {/* Card Top: identity + status */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center border flex-shrink-0 transition-all",
                        isActiveRoom
                          ? "bg-primary text-white border-primary"
                          : "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 group-hover:bg-primary group-hover:text-white"
                      )}>
                         <Video className={cn("h-6 w-6", isActiveRoom ? "text-white" : "text-primary group-hover:text-white")} />
                      </div>
                      <div>
                        <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white leading-tight">
                          {m.connectionId?.userABizName} & {m.connectionId?.userBBizName}
                        </h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
                          Organizer: {m.organizerId?.name} | Attendee: {m.attendeeId?.name}
                        </p>
                      </div>
                    </div>
                    <Badge className={`uppercase text-[9px] font-black tracking-wider px-3 py-1.5 border-none w-fit sm:flex-shrink-0 ${(!m.status || m.status === 'SCHEDULED') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                       {m.status || 'SCHEDULED'}
                    </Badge>
                  </div>

                  {/* Meta info row */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-5">
                     <div className="flex items-center gap-2">
                        <CalendarIcon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                          {format(new Date(m.startTime), "MMM dd, yyyy")}
                        </span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                          {format(new Date(m.startTime), "hh:mm a")} · 40 min
                        </span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Video className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                          Whereby
                        </span>
                        {isOrganizer && m.hostMeetLink && (
                          <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-md">Host</span>
                        )}
                     </div>
                  </div>

                  {/* Actions */}
                   <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      {(!m.status || m.status === 'SCHEDULED') && m.meetLink && (
                        isActiveRoom ? (
                          <Button
                            onClick={handleCloseRoom}
                            className="w-full sm:w-auto rounded-xl bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[9px] h-10 px-6 shadow-lg flex items-center justify-center gap-2 transition-all"
                          >
                            <X className="h-3 w-3" /> Close Room
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleJoinMeeting(m)}
                            className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[9px] h-10 px-6 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all"
                          >
                            <Video className="h-3 w-3" />
                            {isOrganizer && m.hostMeetLink ? "Join as Host" : "Join Meeting"}
                          </Button>
                        )
                      )}
                      {/* Leave Feedback always available */}
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto rounded-xl border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 font-black uppercase tracking-widest text-[9px] h-10 px-6 hover:bg-amber-50 dark:hover:bg-amber-900/10 flex items-center justify-center gap-2 transition-all"
                        onClick={() => { setFeedbackMeeting(m); setFeedbackOpen(true) }}
                      >
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Leave Feedback
                      </Button>
                   </div>
               </div>
             )
           })}
        </div>
      )}

      {!loading && filteredMeetings.length === 0 && !isScheduling && (
        <div className="py-16 text-center bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
          <CalendarIcon className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No meetings scheduled</p>
        </div>
      )}

      {loading && (
        <div className="py-16 text-center">
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm animate-pulse">Loading meetings...</p>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackMeeting && (
        <FeedbackModal
          open={feedbackOpen}
          onClose={() => { setFeedbackOpen(false); setFeedbackMeeting(null) }}
          meetingId={feedbackMeeting._id}
          partnerName={
            feedbackMeeting.organizerId?._id === user?._id
              ? (feedbackMeeting.connectionId?.userBBizName || "Partner")
              : (feedbackMeeting.connectionId?.userABizName || "Partner")
          }
          onSubmitted={fetchMeetings}
        />
      )}
    </div>
  )
}

export default function MeetingsPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-slate-400 font-black uppercase tracking-widest text-sm animate-pulse">Loading...</div>}>
      <MeetingsContent />
    </Suspense>
  )
}
