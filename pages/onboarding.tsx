"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  ImagePlus,
  Loader2,
  Mail,
  Plus,
  SkipForward,
  X,
  Clock,
  Link2,
  Building2,
  User,
  Send,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

// ============================================================================
// Types
// ============================================================================

interface StepConfig {
  id: string
  title: string
  subtitle: string
}

interface TeamData {
  name: string
  slug?: string
  id?: string
}

interface ProfileData {
  firstName: string
  lastName: string
  username: string
  image: string | null
}

interface AvailabilityDay {
  day: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

interface AvailabilityData {
  timeGap: number
  days: AvailabilityDay[]
}

interface SavedProgress {
  currentStep: number
  teamData: TeamData
  profileData: ProfileData
  availabilityData: AvailabilityData
}

const DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
]

const STEPS: StepConfig[] = [
  {
    id: "team",
    title: "Create your team",
    subtitle: "Start by naming your team to get started",
  },
  {
    id: "connect",
    title: "Connect your calendar",
    subtitle: "Sync Google Calendar for seamless scheduling",
  },
  {
    id: "profile",
    title: "Create your profile",
    subtitle: "Let others know who you are",
  },
  {
    id: "availability",
    title: "Set your availability",
    subtitle: "Define when you're available for meetings",
  },
  {
    id: "invite",
    title: "Invite your team",
    subtitle: "Add members to start collaborating",
  },
]

const BG_IMAGE =
  "https://jvy2df78gy.ufs.sh/f/ti9fiW1kHPhtFLuJw5zmMsY53hCly1XijrUnO9batBwAd7RZ"

// ============================================================================
// SessionStorage persistence (survives OAuth redirects)
// ============================================================================

const STORAGE_KEY = "onboarding_progress"

function getInitialProgress(): SavedProgress | null {
  if (typeof window === "undefined") return null

  // If OAuth success params exist, return step 3 directly (skip flash of step 2)
  const params = new URLSearchParams(window.location.search)
  if (params.get("success") === "true" && params.get("provider")) {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SavedProgress
        return { ...parsed, currentStep: 3 }
      } catch {
        // fall through
      }
    }
    return null
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as SavedProgress) : null
  } catch {
    return null
  }
}

function saveProgress(data: SavedProgress) {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // sessionStorage might be full or disabled
    }
  }
}

function clearProgress() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

// ============================================================================
// Step Indicator
// ============================================================================

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number
  totalSteps: number
}) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1
        const isActive = currentStep === step
        const isCompleted = currentStep > step

        return (
          <div
            key={step}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500 ease-out",
              isActive
                ? "w-6 bg-white"
                : isCompleted
                  ? "w-1.5 bg-white/60"
                  : "w-1.5 bg-white/25"
            )}
          />
        )
      })}
    </div>
  )
}

// ============================================================================
// Toast
// ============================================================================

function Toast({
  message,
  type,
  onClose,
}: {
  message: string
  type: "success" | "error"
  onClose: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className={cn(
        "fixed top-6 left-1/2 z-[100] flex items-center gap-2.5 rounded-xl px-5 py-3 shadow-2xl",
        "animate-[toastIn_0.35s_cubic-bezier(0.32,0.72,0,1)]",
        type === "success"
          ? "bg-emerald-500 text-white"
          : "bg-red-500 text-white"
      )}
    >
      {type === "success" ? (
        <Check className="h-4 w-4 shrink-0" />
      ) : (
        <X className="h-4 w-4 shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-2 rounded-full p-0.5 hover:bg-white/20 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ============================================================================
// Step 1: Create Team
// ============================================================================

function StepCreateTeam({
  data,
  onChange,
  onNext,
  isLoading,
}: {
  data: TeamData
  onChange: (data: TeamData) => void
  onNext: () => void
  isLoading: boolean
}) {
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!data.name.trim()) {
      setError("Team name is required")
      return
    }

    try {
      const response = await fetch("/api/teams/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name.trim() }),
      })

      if (!response.ok) {
        const json = await response.json()
        setError(json.error?.message || "Failed to create team")
        return
      }

      const json = await response.json()
      onChange({ ...data, slug: json.data.slug, id: json.data.id })
      onNext()
    } catch {
      setError("Something went wrong. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
      <div className="relative group">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all group-hover:bg-white/15 group-hover:scale-105">
          <Building2 className="h-9 w-9 text-white/80" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-lg">
          <Plus className="h-3.5 w-3.5 text-gray-700" />
        </div>
      </div>

      <div className="w-full max-w-sm space-y-2">
        <Input
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="e.g. Acme Corp"
          className={cn(
            "h-12 rounded-xl border-white/20 bg-white/10 text-center text-base text-white placeholder:text-white/40 backdrop-blur-sm",
            "focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:bg-white/15",
            "transition-all duration-200"
          )}
          autoFocus
          disabled={isLoading}
        />
        {error && (
          <p className="text-center text-xs text-red-300 animate-[fadeIn_0.2s_ease-out]">
            {error}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading || !data.name.trim()}
        className={cn(
          "h-11 w-full max-w-sm rounded-xl bg-white text-gray-900 font-semibold text-sm",
          "hover:bg-white/90 active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all duration-200"
        )}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </form>
  )
}

// ============================================================================
// Step 2: Connect Google
// ============================================================================

function StepConnectGoogle({
  onNext,
  onSkip,
  isLoading,
  setIsLoading,
}: {
  teamSlug?: string
  onNext: () => void
  onSkip: () => void
  isLoading: boolean
  setIsLoading: (v: boolean) => void
}) {
  const handleConnect = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        "/api/integration/connect/GOOGLE_MEET_AND_CALENDAR"
      )
      if (!response.ok) throw new Error("Failed to get connection URL")
      const data = await response.json()
      // Full page redirect to Google OAuth — state is saved in sessionStorage
      window.location.href = data.url
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-2xl shadow-black/20">
          <svg className="h-12 w-12" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-white">
          Connect Google Calendar
        </h3>
        <p className="text-sm text-white/60 max-w-xs">
          Sync your calendar to see availability and avoid scheduling conflicts
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <Button
          type="button"
          onClick={handleConnect}
          disabled={isLoading}
          className={cn(
            "h-12 w-full rounded-xl bg-white text-gray-900 font-semibold text-sm",
            "hover:bg-white/90 active:scale-[0.98]",
            "disabled:opacity-50 transition-all duration-200",
            "flex items-center justify-center gap-2.5"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Connect Google
        </Button>

        <button
          type="button"
          onClick={onSkip}
          className="block w-full text-center text-sm text-white/50 hover:text-white/80 transition-colors py-2"
        >
          Continue without sync
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// Step 3: Create Profile
// ============================================================================

function StepCreateProfile({
  data,
  onChange,
  onNext,
  isLoading,
}: {
  data: ProfileData
  onChange: (data: ProfileData) => void
  onNext: () => void
  isLoading: boolean
}) {
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (file: File) => {
    if (file.size / 1024 / 1024 > 2) {
      setError("File size too big (max 2MB)")
      return
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("File type not supported (.png, .jpg, .webp)")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      onChange({ ...data, image: e.target?.result as string })
      setError("")
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleImageUpload(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!data.firstName.trim() || !data.lastName.trim()) {
      setError("First and last name are required")
      return
    }
    if (data.username.trim().length < 3) {
      setError("Username must be at least 3 characters")
      return
    }

    try {
      const usernameRes = await fetch("/api/set-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.username.trim() }),
      })
      if (!usernameRes.ok) {
        const json = await usernameRes.json()
        setError(json.message || "Username is already taken")
        return
      }

      const userRes = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${data.firstName.trim()} ${data.lastName.trim()}`,
          image: data.image,
        }),
      })
      if (!userRes.ok) {
        setError("Failed to update profile")
        return
      }

      onNext()
    } catch {
      setError("Something went wrong. Please try again.")
    }
  }

  const displayName = [data.firstName, data.lastName]
    .filter(Boolean)
    .join(" ")
    .trim()

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
      {/* Avatar */}
      <div className="relative group">
        <div
          className={cn(
            "flex h-24 w-24 items-center justify-center rounded-full overflow-hidden",
            "border-2 border-white/30 bg-white/10 backdrop-blur-sm",
            "transition-all group-hover:border-white/50 cursor-pointer",
            dragActive && "border-white scale-105"
          )}
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragEnter={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setDragActive(false)
          }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {data.image ? (
            <Image
              src={data.image}
              alt="Profile"
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          ) : displayName ? (
            <span className="text-2xl font-semibold text-white/80">
              {displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
          ) : (
            <User className="h-10 w-10 text-white/40" />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <ImagePlus className="h-5 w-5 text-white" />
            <span className="text-[10px] text-white/80 font-medium">Upload</span>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageUpload(file)
          }}
        />
        {data.image && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange({ ...data, image: null })
            }}
            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 border-2 border-gray-900 shadow-lg hover:bg-red-600 transition-colors"
          >
            <X className="h-3 w-3 text-white" />
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="w-full max-w-sm space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-white/60">First Name</Label>
            <Input
              value={data.firstName}
              onChange={(e) => onChange({ ...data, firstName: e.target.value })}
              placeholder="Viral"
              className={cn(
                "h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/30",
                "focus:border-white/40 focus:ring-2 focus:ring-white/20",
                "transition-all duration-200"
              )}
              autoFocus
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-white/60">Last Name</Label>
            <Input
              value={data.lastName}
              onChange={(e) => onChange({ ...data, lastName: e.target.value })}
              placeholder="Kanishk"
              className={cn(
                "h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/30",
                "focus:border-white/40 focus:ring-2 focus:ring-white/20",
                "transition-all duration-200"
              )}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-white/60">Username</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40 pointer-events-none">
              conferio.in/
            </span>
            <Input
              value={data.username}
              onChange={(e) =>
                onChange({
                  ...data,
                  username: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, ""),
                })
              }
              placeholder="john_doe18"
              className={cn(
                "h-11 rounded-xl border-white/20 bg-white/10 pl-[5.5rem] text-white placeholder:text-white/30",
                "focus:border-white/40 focus:ring-2 focus:ring-white/20",
                "transition-all duration-200"
              )}
              disabled={isLoading}
            />
          </div>
        </div>
        {error && (
          <p className="text-center text-xs text-red-300 animate-[fadeIn_0.2s_ease-out]">
            {error}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={
          isLoading ||
          !data.firstName.trim() ||
          !data.lastName.trim() ||
          data.username.trim().length < 3
        }
        className={cn(
          "h-11 w-full max-w-sm rounded-xl bg-white text-gray-900 font-semibold text-sm",
          "hover:bg-white/90 active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all duration-200"
        )}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </span>
        ) : (
          "Continue"
        )}
      </Button>
    </form>
  )
}

// ============================================================================
// Step 4: Availability
// ============================================================================

function StepAvailability({
  data,
  onChange,
  onNext,
  onBack,
  isLoading,
}: {
  data: AvailabilityData
  onChange: (data: AvailabilityData) => void
  onNext: () => void
  onBack: () => void
  isLoading: boolean
}) {
  const [error, setError] = useState("")

  const toggleDay = (day: string) => {
    onChange({
      ...data,
      days: data.days.map((d) =>
        d.day === day ? { ...d, isAvailable: !d.isAvailable } : d
      ),
    })
  }

  const updateTime = (
    day: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    onChange({
      ...data,
      days: data.days.map((d) =>
        d.day === day ? { ...d, [field]: value } : d
      ),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const response = await fetch("/api/availability/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to save")
      onNext()
    } catch {
      setError(
        "Failed to save availability. You can set this later in settings."
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-white/50" />
          <span className="text-sm text-white/70">Buffer between meetings</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={data.timeGap}
            onChange={(e) =>
              onChange({ ...data, timeGap: parseInt(e.target.value) || 15 })
            }
            min="0"
            max="120"
            className={cn(
              "h-9 w-16 rounded-lg border-white/20 bg-white/10 text-center text-sm text-white",
              "focus:border-white/40 focus:ring-1 focus:ring-white/20",
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            )}
            disabled={isLoading}
          />
          <span className="text-xs text-white/50">min</span>
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
        {data.days.map((dayData) => (
          <div
            key={dayData.day}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
              dayData.isAvailable ? "bg-white/5" : "opacity-60"
            )}
          >
            <button
              type="button"
              onClick={() => toggleDay(dayData.day)}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors duration-200 shrink-0",
                dayData.isAvailable ? "bg-white" : "bg-white/20"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-gray-900 shadow-sm transition-transform duration-200",
                  dayData.isAvailable
                    ? "translate-x-[18px]"
                    : "translate-x-0.5"
                )}
              />
            </button>
            <span className="w-8 text-sm font-medium text-white/80 shrink-0">
              {dayData.day.slice(0, 3)}
            </span>
            {dayData.isAvailable ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="time"
                  value={dayData.startTime}
                  onChange={(e) =>
                    updateTime(dayData.day, "startTime", e.target.value)
                  }
                  className={cn(
                    "h-8 rounded-lg border-white/20 bg-white/10 text-xs text-white",
                    "focus:border-white/40 focus:ring-1 focus:ring-white/20",
                    "transition-all duration-200"
                  )}
                  disabled={isLoading}
                />
                <span className="text-xs text-white/40">to</span>
                <Input
                  type="time"
                  value={dayData.endTime}
                  onChange={(e) =>
                    updateTime(dayData.day, "endTime", e.target.value)
                  }
                  className={cn(
                    "h-8 rounded-lg border-white/20 bg-white/10 text-xs text-white",
                    "focus:border-white/40 focus:ring-1 focus:ring-white/20",
                    "transition-all duration-200"
                  )}
                  disabled={isLoading}
                />
              </div>
            ) : (
              <span className="text-xs text-white/30">Unavailable</span>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-center text-xs text-amber-300">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          onClick={onBack}
          variant="ghost"
          className={cn(
            "h-11 flex-1 rounded-xl text-white/60 hover:text-white hover:bg-white/10",
            "transition-all duration-200"
          )}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "h-11 flex-1 rounded-xl bg-white text-gray-900 font-semibold text-sm",
            "hover:bg-white/90 active:scale-[0.98]",
            "disabled:opacity-50 transition-all duration-200"
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Continue
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}

// ============================================================================
// Step 5: Invite Team
// ============================================================================

function StepInviteTeam({
  teamSlug,
  onNext,
  onBack,
}: {
  teamSlug?: string
  onNext: () => void
  onBack: () => void
  isLoading: boolean
}) {
  const [emails, setEmails] = useState<string[]>([""])
  const [invitationLink, setInvitationLink] = useState<string | null>(null)
  const [linkLoading, setLinkLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const addEmailField = () => {
    if (emails.length < 5) setEmails([...emails, ""])
  }

  const updateEmail = (index: number, value: string) => {
    const next = [...emails]
    next[index] = value
    setEmails(next)
  }

  const removeEmail = (index: number) => {
    if (emails.length > 1) setEmails(emails.filter((_, i) => i !== index))
  }

  // FIX: POST returns 204 (no body), so we fetch the list afterwards to get the URL
  const handleCreateLink = async () => {
    if (!teamSlug || linkLoading) return
    setLinkLoading(true)

    try {
      // Step 1 — create the link-type invitation
      const createRes = await fetch(`/api/teams/${teamSlug}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domains: "",
          role: "MEMBER",
          sentViaEmail: false,
        }),
      })
      if (!createRes.ok) return

      // Step 2 — fetch the invitation list to retrieve the generated URL
      const listRes = await fetch(
        `/api/teams/${teamSlug}/invitations?sentViaEmail=false`
      )
      if (!listRes.ok) return

      const listData = await listRes.json()
      // Handle multiple possible response shapes from the API
      const invitations = Array.isArray(listData)
        ? listData
        : listData?.invitations || listData?.data || []

      const linkInv = invitations[0]
      if (linkInv?.url) {
        setInvitationLink(linkInv.url)
      } else if (linkInv?.token) {
        // Fallback: construct URL from token
        setInvitationLink(
          `${window.location.origin}/invite/${linkInv.token}`
        )
      }
    } catch {
      // Silent fail — user can still use email invites
    } finally {
      setLinkLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSendInvites = async () => {
    const validEmails = emails.filter(
      (e) => e.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())
    )
    if (validEmails.length === 0) {
      setError("Please enter at least one valid email")
      return
    }
    if (!teamSlug) {
      setError("Team not found. Please try again.")
      return
    }

    setSending(true)
    setError("")

    try {
      await Promise.all(
        validEmails.map((email) =>
          fetch(`/api/teams/${teamSlug}/invitations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email.trim(),
              role: "MEMBER",
              sentViaEmail: true,
            }),
          })
        )
      )
      onNext()
    } catch {
      setError("Failed to send invitations. You can invite members later.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Email inputs */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-white/60">
          Email addresses
        </Label>
        <div className="space-y-2">
          {emails.map((email, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  value={email}
                  onChange={(e) => updateEmail(index, e.target.value)}
                  placeholder="name@company.com"
                  type="email"
                  className={cn(
                    "h-10 rounded-xl border-white/20 bg-white/10 pl-10 text-sm text-white placeholder:text-white/30",
                    "focus:border-white/40 focus:ring-2 focus:ring-white/20",
                    "transition-all duration-200"
                  )}
                  disabled={sending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (index === emails.length - 1) addEmailField()
                    }
                  }}
                />
              </div>
              {emails.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEmail(index)}
                  className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/10 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {emails.length < 5 && (
          <button
            type="button"
            onClick={addEmailField}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors py-1"
          >
            <Plus className="h-3 w-3" />
            Add another
          </button>
        )}
      </div>

      {/* Invite link */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-white/60">
            Or share an invitation link
          </Label>
          {!invitationLink && (
            <button
              type="button"
              onClick={handleCreateLink}
              disabled={linkLoading}
              className="text-xs text-white/50 hover:text-white/80 transition-colors disabled:opacity-50"
            >
              {linkLoading ? "Generating…" : "Generate link"}
            </button>
          )}
        </div>

        {invitationLink ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5">
              <Link2 className="h-4 w-4 text-white/30 shrink-0" />
              <span className="text-xs text-white/60 truncate">
                {invitationLink}
              </span>
            </div>
            <Button
              type="button"
              onClick={handleCopyLink}
              variant="ghost"
              size="sm"
              className={cn(
                "shrink-0 h-10 px-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10",
                "transition-all duration-200"
              )}
            >
              {copied ? (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </span>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-white/15 px-3 py-2.5">
            <Link2 className="h-4 w-4 text-white/20 shrink-0" />
            <span className="text-xs text-white/30">
              Click &quot;Generate link&quot; to create a shareable URL
            </span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-center text-xs text-amber-300 animate-[fadeIn_0.2s_ease-out]">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          onClick={onBack}
          variant="ghost"
          className={cn(
            "h-11 flex-1 rounded-xl text-white/60 hover:text-white hover:bg-white/10",
            "transition-all duration-200"
          )}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSendInvites}
          disabled={sending || !emails.some((e) => e.trim())}
          className={cn(
            "h-11 flex-1 rounded-xl bg-white text-gray-900 font-semibold text-sm",
            "hover:bg-white/90 active:scale-[0.98]",
            "disabled:opacity-50 transition-all duration-200"
          )}
        >
          {sending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Invites
            </span>
          )}
        </Button>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors py-1"
      >
        <SkipForward className="h-4 w-4" />
        Skip for now
      </button>
    </div>
  )
}

// ============================================================================
// Finishing Screen (shown inside the modal)
// ============================================================================

function FinishingScreen() {
  return (
    <div className="flex flex-col items-center gap-5 py-8 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
        <Check className="h-10 w-10 text-emerald-400" />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white">
          You&apos;re all set!
        </h3>
        <p className="text-sm text-white/50 mt-1.5">
          Redirecting to your dashboard…
        </p>
      </div>
      <Loader2 className="h-5 w-5 animate-spin text-white/30" />
    </div>
  )
}

// ============================================================================
// Main Onboarding Page
// ============================================================================

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()

  // ── Restore progress from sessionStorage (survives OAuth redirect) ──
  const savedProgress = getInitialProgress()

  const [currentStep, setCurrentStep] = useState(savedProgress?.currentStep || 1)
  const [teamData, setTeamData] = useState<TeamData>(
    savedProgress?.teamData || { name: "" }
  )
  const [profileData, setProfileData] = useState<ProfileData>(
    savedProgress?.profileData || {
      firstName: "",
      lastName: "",
      username: "",
      image: null,
    }
  )
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData>(
    savedProgress?.availabilityData || {
      timeGap: 15,
      days: DAYS.map((day) => ({
        day,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: !["SUNDAY", "SATURDAY"].includes(day),
      })),
    }
  )

  const [isLoading, setIsLoading] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error"
  } | null>(null)

  // ── Populate profile from session when no saved progress ──
  useEffect(() => {
    if (session?.user && !savedProgress?.profileData) {
      setProfileData((prev) => ({
        firstName:
          prev.firstName || session.user?.name?.split(" ")[0] || "",
        lastName:
          prev.lastName ||
          session.user?.name?.split(" ").slice(1).join(" ") ||
          "",
        image: prev.image || session.user?.image || null,
        username: prev.username,
      }))
    }
  }, [session?.user, savedProgress?.profileData])

  // ── Persist progress to sessionStorage on every change ──
  useEffect(() => {
    if (!isFinishing) {
      saveProgress({ currentStep, teamData, profileData, availabilityData })
    }
  }, [currentStep, teamData, profileData, availabilityData, isFinishing])

  // ── Handle OAuth callback params ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const success = params.get("success")
    const error = params.get("error")
    const provider = params.get("provider")

    if (success === "true" && provider) {
      setToast({ message: "Google connected successfully!", type: "success" })
      setCurrentStep(3) // Skip to profile
      window.history.replaceState({}, "", "/onboarding")
    } else if (error && provider) {
      setToast({
        message: `Failed to connect ${provider}`,
        type: "error",
      })
      window.history.replaceState({}, "", "/onboarding")
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Redirect unauthenticated users ──
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // ── Navigation ──
  const goNext = useCallback(() => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }, [currentStep]) // eslint-disable-line react-hooks/exhaustive-deps

  const goBack = useCallback(() => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1)
  }, [currentStep])

  const handleComplete = async () => {
    setIsFinishing(true)
    clearProgress()

    try {
      await update({
        onboardingComplete: true,
        username: profileData.username,
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        image: profileData.image,
      })
    } catch {
      // Continue redirect even if session update fails
    }

    // Short delay so the user sees the success animation
    setTimeout(() => {
      router.push(
        teamData.slug ? `/teams/${teamData.slug}/members` : "/dashboard"
      )
    }, 1500)
  }

  const stepConfig = STEPS[currentStep - 1]

  // ── Auth loading ──
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    )
  }

  return (
    <>
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
      />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div
          className="w-full max-w-md animate-[modalIn_0.5s_cubic-bezier(0.32,0.72,0,1)]"
          key={isFinishing ? "finishing" : `step-${currentStep}`}
        >
          <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Header */}
            {!isFinishing && (
              <div className="px-8 pt-8 pb-2">
                <StepIndicator
                  currentStep={currentStep}
                  totalSteps={STEPS.length}
                />
                <div className="mt-6 text-center">
                  <h2 className="text-xl font-semibold text-white tracking-tight">
                    {stepConfig.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-white/50">
                    {stepConfig.subtitle}
                  </p>
                </div>
              </div>
            )}

            {/* Body */}
            <div className="px-8 py-6">
              {isFinishing ? (
                <FinishingScreen />
              ) : (
                <>
                  {currentStep === 1 && (
                    <StepCreateTeam
                      data={teamData}
                      onChange={setTeamData}
                      onNext={goNext}
                      isLoading={isLoading}
                    />
                  )}
                  {currentStep === 2 && (
                    <StepConnectGoogle
                      teamSlug={teamData.slug}
                      onNext={goNext}
                      onSkip={goNext}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                    />
                  )}
                  {currentStep === 3 && (
                    <StepCreateProfile
                      data={profileData}
                      onChange={setProfileData}
                      onNext={goNext}
                      isLoading={isLoading}
                    />
                  )}
                  {currentStep === 4 && (
                    <StepAvailability
                      data={availabilityData}
                      onChange={setAvailabilityData}
                      onNext={goNext}
                      onBack={goBack}
                      isLoading={isLoading}
                    />
                  )}
                  {currentStep === 5 && (
                    <StepInviteTeam
                      teamSlug={teamData.slug}
                      onNext={goNext}
                      onBack={goBack}
                      isLoading={isLoading}
                    />
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!isFinishing && (
              <div className="px-8 pb-6">
                <p className="text-center text-[11px] text-white/25">
                  Step {currentStep} of {STEPS.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Styles */}
      <style jsx global>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-12px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1) opacity(0.5);
          cursor: pointer;
        }
      `}</style>
    </>
  )
}