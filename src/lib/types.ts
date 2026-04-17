export type UserRole = "student" | "admin";
export type TestAccessType = "demo" | "paid";
export type FlashKind = "success" | "error" | "info";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  is_active: boolean;
  is_paid: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type RecordingSummary = {
  id: number;
  title: string | null;
  wpm: number;
  audio_url: string;
  is_active: boolean;
  created_at: string;
};

export type PracticeTest = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  access_type: TestAccessType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  recordings?: RecordingSummary[];
};

export type TranscriptMistake = {
  type: "substitution" | "insertion" | "deletion";
  expected?: string;
  actual?: string;
  referenceIndex: number;
  submittedIndex: number;
};

export type TranscriptComparison = {
  normalizedReference: string[];
  normalizedSubmission: string[];
  matchedWords: number;
  referenceWordCount: number;
  submittedWordCount: number;
  mistakeCount: number;
  accuracy: number;
  mistakes: TranscriptMistake[];
};

export type Attempt = {
  id: number;
  user_id: string;
  recording_id: number;
  submitted_transcript: string;
  accuracy: number;
  matched_words: number;
  reference_word_count: number;
  submitted_word_count: number;
  mistake_count: number;
  mistake_details: TranscriptMistake[];
  created_at: string;
};

export type SearchParams = Record<string, string | string[] | undefined>;
