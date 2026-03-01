import type { WeldySession } from "./types";

export type TranscriptMessage = {
  engineerId: string;
  engineerName: string;
  role: string;
  text: string;
  timestamp: string;
};

export const conversations = new Map<string, TranscriptMessage[]>();
export const sessionStore = new Map<string, WeldySession>();
