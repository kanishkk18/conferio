import type { Page } from '@playwright/test';
import { Member, User, Server } from "@prisma/client";
import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
// import { User } from '@sentry/nextjs';

// Types for Playwright request wrappers
export type RequestOptionsWithBody = Parameters<Page['request']['post']>[1];
export type RequestOptionsNoBody = Parameters<Page['request']['get']>[1];

export interface Board {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  color?: string;
  order: number;
  boardId: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date;
  order: number;
  columnId: string;
  boardId: string;
  assignees: TaskAssignee[];
  labels: TaskLabel[];
  attachments: Attachment[];
  subtasks: Subtask[];
  comments: Comment[];
  activities: ActivityLog[];
}

// ... additional types as needed

export interface BoardMember {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  user: User;
}

// export interface Column {
//   id: string;
//   title: string;
//   color?: string;
//   order: number;
//   boardId: string;
//   tasks: Task[];
// }

// export interface Task {
//   id: string;
//   title: string;
//   description?: string;
//   coverImage?: string;
//   status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
//   priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
//   dueDate?: string;
//   order: number;
//   isArchived: boolean;
//   columnId: string;
//   boardId: string;
//   assignees: TaskAssignee[];
//   labels: TaskLabel[];
//   attachments: Attachment[];
//   subtasks: Subtask[];
//   comments: Comment[];
//   activities: ActivityLog[];
//   _count: {
//     comments: number;
//     attachments: number;
//   };
// }

export interface TaskAssignee {
  id: string;
  user: User;
  assignedAt: string;
}

export interface TaskLabel {
  id: string;
  label: Label;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  key: string;
  size?: number;
  mimeType?: string;
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  order: number;
}

export interface Comment {
  id: string;
  content: string;
  user: User;
  attachments: CommentAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentAttachment {
  id: string;
  filename: string;
  url: string;
  key: string;
  size?: number;
  mimeType?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  description: string;
  metadata?: any;
  user: User;
  createdAt: string;
}


export type MultiInputChangeEvent =
    | React.ChangeEvent<HTMLInputElement>
    | React.ChangeEvent<HTMLTextAreaElement>
    | React.ChangeEvent<HTMLSelectElement>;
export type MultiInputFocusEvent =
    | React.FocusEvent<HTMLInputElement>
    | React.FocusEvent<HTMLTextAreaElement>
    | React.FocusEvent<HTMLSelectElement>;

    export type ServerWithMembersWithProfiles = Server & {
  members: (Member & { user: User })[];
};


export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & { server: NetServer & { io: SocketIOServer } };
};

export interface Album {
  id: string;
  name: string;
  description: string;
  year: number | null;
  type: string;
  playCount: number | null;
  language: string;
  explicitContent: boolean;
  artists: {
    primary: Artist[];
    featured: Artist[];
    all: Artist[];
  };
  url: string;
  image: ImageQuality[];
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  type: string;
  image: ImageQuality[];
  url: string;
}

export interface ImageQuality {
  quality: string;
  url: string;
}

export interface SearchResponses<T> {
  success: boolean;
  data: {
    total: number;
    start: number;
    results: T[];
  };
}

export interface Playlist {
  id: string;
  name: string;
  type: string;
  image: ImageQuality[];
  url: string;
  songCount: number | null;
  language: string;
  explicitContent: boolean;
}

export interface Song {
  id: string
  name: string
  type: string
  year: string | null
  releaseDate: string | null
  duration: number | null
  label: string | null
  explicitContent: boolean
  playCount: number | null
  language: string
  hasLyrics: boolean
  lyricsId: string | null
  url: string
  copyright: string | null
  album: {
    id: string | null
    name: string | null
    url: string | null
  }
  artists: {
    primary: Artist[]
    featured: Artist[]
    all: Artist[]
  }
  image: ImageQuality[]
  downloadUrl: DownloadUrl[]
}

export interface Artist {
  id: string
  name: string
  role: string
  type: string
  image: ImageQuality[]
  url: string
}

export interface Album {
  id: string
  name: string
  description: string
  year: number | null
  type: string
  playCount: number | null
  language: string
  explicitContent: boolean
  artists: {
    primary: Artist[]
    featured: Artist[]
    all: Artist[]
  }
  songCount: number | null
  url: string
  image: ImageQuality[]
  songs: Song[]
}

export interface Playlist {
  id: string
  name: string
  description: string | null
  year: number | null
  type: string
  playCount: number | null
  language: string
  explicitContent: boolean
  songCount: number | null
  url: string
  image: ImageQuality[]
  songs: Song[]
  artists: Artist[]
}

export interface ImageQuality {
  quality: string
  url: string
}

export interface DownloadUrl {
  quality: string
  url: string
}

export interface SearchResponse {
  success: boolean
  data: {
    albums: { results: any[], position: number }
    songs: { results: Song[], position: number }
    artists: { results: Artist[], position: number }
    playlists: { results: any[], position: number }
    topQuery: { results: Song[], position: number }
  }
}

export interface AnimatedIconProps {
  /** Icon size in pixels or CSS string */
  size?: number | string;
  /** Icon color (defaults to currentColor) */
  color?: string;
  /** SVG stroke width */
  strokeWidth?: number;
  /** Additional CSS classes */
  className?: string;
}

export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}