import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import animationData from "../public/assets/lottie-json.json";
import { v4 as uuidv4 } from 'uuid'
import { decode, encode } from 'js-base64'
import { SignJWT, jwtVerify } from 'jose';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const colors = [
  "bg-gradient-to-r from-yellow-400 to-amber-500 text-[#fff] border-none",
  "bg-gradient-to-r from-cyan-500 to-blue-600 text-bold text-[#fff]  border-none",
  "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-[#fff] border-none",
  "bg-gradient-to-r from-amber-500 to-pink-500 text-[#fff] border-none",
  'bg-gradient-to-r from-red-500 to-orange-500 text-[#fff] border-none'
];

export const getColor = (color) => {
  if (color >= 0 && color < colors.length) {
    return colors[color];
  }
  return colors[0]; // Fallback to the first color if out of range
};

export const animationDefaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export function slugify(text: string): string {
  const uuid = uuidv4().replace(/\s+/g, "").slice(0, 4)

  const slug = text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")

  return `${slug}-${uuid}`
}

// export function encodeState(data: any): string {
//   return encode(JSON.stringify(data))
// }

// export function decodeState(state: string): any {
//   return JSON.parse(decode(state))
// }

export const MeetingFilterEnum = {
  UPCOMING: "UPCOMING",
  PAST: "PAST",
  CANCELLED: "CANCELLED",
} as const

export async function encodeState(payload: any): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('10m')
    .sign(secret);
}

export async function decodeState(state: string): Promise<any> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const { payload } = await jwtVerify(state, secret);
  return payload;
}

export type MeetingFilterEnumType = (typeof MeetingFilterEnum)[keyof typeof MeetingFilterEnum]

const BYTE_UNIT = 1024;

// Format bytes into human-readable string
export function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;

  while (bytes >= BYTE_UNIT && i < units.length - 1) {
    bytes /= BYTE_UNIT;
    i++;
  }
  const value = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(bytes);

  return `${value}${units[i]}`;
}

export function getCleanAssetType(mimeType: string, ext: string): string {
  if (mimeType.startsWith("image/")) {
    return "Image";
  }
  if (mimeType.startsWith("video/")) {
    return "Video";
  }
  if (mimeType.startsWith("audio/")) {
    return "Audio";
  }
  if (mimeType === "application/pdf") {
    return "PDF";
  }
  if (mimeType.includes("wordprocessingml") || ext.toUpperCase() === "DOCX") {
    return "Document (DOCX)";
  }
  if (mimeType.includes("spreadsheetml") || ext.toUpperCase() === "XLSX") {
    return "Spreadsheet (XLSX)";
  }
  if (mimeType.includes("presentationml") || ext.toUpperCase() === "PPTX") {
    return "Presentation (PPTX)";
  }
  if (mimeType.includes("zip") || ext.toUpperCase() === "ZIP") {
    return "Archive (ZIP)";
  }
  if (mimeType.includes("text/plain") || ext.toUpperCase() === "TXT") {
    return "Text File";
  }
  // Fallback for other types
  return ext.toUpperCase() || "Unknown";
}

export function sanitizeFilename(filename: string) {
  return filename
    .replace(/[^a-zA-Z0-9-_.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

export function generateAPIKey(type: string = 'live') {
  const secret = crypto.randomUUID().replace(/-/g, '');
  const rawKey = `sk_${type}_${secret}`;
  const displayKey = `sk_${type}_${secret.slice(0, 4)}...`;
  const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

  return {
    rawKey,
    hashedKey,
    displayKey,
  };
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
 
export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
 
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}
 
export function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15);
}
 
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "…";
}
 
// export function formatDate(date: Date | string): string {
//   return new Intl.DateTimeFormat('en-US', {
//     month: 'short',
//     day: 'numeric',
//     year: 'numeric',
//   }).format(new Date(date));
// }

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function calculateWorkloadScore(
  totalTasks: number,
  completedTasks: number,
  overdueTasks: number,
  totalHours: number
): number {
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const overdueRate = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;
  const hoursPerTask = totalTasks > 0 ? totalHours / totalTasks : 0;
  
  // Normalize hours per task (optimal is around 4-6 hours)
  const hoursScore = Math.max(0, 100 - Math.abs(hoursPerTask - 5) * 10);
  
  // Weighted score
  const score = (completionRate * 0.4) + ((100 - overdueRate) * 0.4) + (hoursScore * 0.2);
  
  return Math.min(100, Math.max(0, score));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    TODO: 'bg-slate-500',
    IN_PROGRESS: 'bg-blue-500',
    IN_REVIEW: 'bg-yellow-500',
    BLOCKED: 'bg-red-500',
    COMPLETED: 'bg-green-500',
    CANCELLED: 'bg-gray-500',
  };
  return colors[status] || 'bg-slate-500';
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: 'bg-blue-100 text-blue-800 border-blue-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    URGENT: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
