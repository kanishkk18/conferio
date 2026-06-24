// lib/conferio.ts
import { createId } from '@paralleldrive/cuid2';

const CONFERIO_BASE_URL = process.env.CONFERIO_APP_URL || 'http://localhost:4002';

export interface ConferioMeeting {
  roomId: string;
  joinUrl: string;
  title: string;
}

/**
 * Create a Conferio meeting room
 */
export async function createConferioMeeting(options: {
  title: string;
  hostEmail?: string;
  duration?: number;
}): Promise<ConferioMeeting> {
  const roomId = createId();
  const joinUrl = `${CONFERIO_BASE_URL}/meeting/${roomId}`;

  return {
    roomId,
    joinUrl,
    title: options.title,
  };
}

export function getConferioJoinUrl(roomId: string): string {
  return `${CONFERIO_BASE_URL}/meeting/${roomId}`;
}
