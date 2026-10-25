import { ScriptFormConfig, ScriptGenerationResponse } from '../types';

/**
 * Counts Vietnamese and alphanumeric words accurately
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Rule 2.5 words/second for educational lip-sync videos
 */
export function getWordLimit(durationSeconds: number): number {
  return Math.floor(durationSeconds * 2.5);
}

/**
 * Checks if dialogue exceeds the duration limit
 */
export function checkWordLimit(dialogue: string, durationSeconds: number) {
  const wordCount = countWords(dialogue);
  const maxWords = getWordLimit(durationSeconds);
  const isExceeded = wordCount > maxWords;
  const diff = wordCount - maxWords;

  return {
    wordCount,
    maxWords,
    isExceeded,
    diff,
  };
}

/**
 * Call Step 1 AI Scripting Service
 */
export async function generateScript(config: ScriptFormConfig): Promise<ScriptGenerationResponse> {
  const response = await fetch('/api/script/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Biên kịch AI thất bại (${response.status})`);
  }

  return response.json();
}

/**
 * Call Step 1 AI Shorten Dialogue Service
 */
export async function shortenDialogue(
  dialogue: string,
  maxWords: number,
  targetDuration: number,
  subject?: string,
  lessonTitle?: string
): Promise<{ shortenedDialogue: string; wordCount: number; reductionNote?: string }> {
  const response = await fetch('/api/script/shorten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dialogue,
      maxWords,
      targetDuration,
      subject,
      lessonTitle,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Rút gọn lời thoại thất bại (${response.status})`);
  }

  return response.json();
}
