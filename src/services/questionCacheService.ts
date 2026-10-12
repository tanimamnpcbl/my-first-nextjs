import { Question } from "../types";

const CACHE_PREFIX = "exam_questions_v1_";
const CACHE_TTL_MS = 1000 * 60 * 60 * 2; // 2 Hours TTL cache for questions

interface CachedData {
  timestamp: number;
  questions: Question[];
}

/**
 * Retrieves cached questions from sessionStorage for ultra-fast instant rendering (0ms delay).
 */
export function getCachedQuestions(key: string): Question[] | null {
  if (!key) return null;
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed: CachedData = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed.questions;
    }
  } catch (e) {
    console.warn("Failed to read question cache:", e);
  }
  return null;
}

/**
 * Saves fetched questions to sessionStorage to make subsequent retakes/reviews instant.
 */
export function setCachedQuestions(key: string, questions: Question[]): void {
  if (!key || !Array.isArray(questions) || questions.length === 0) return;
  try {
    const data: CachedData = {
      timestamp: Date.now(),
      questions
    };
    sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save question cache:", e);
  }
}
