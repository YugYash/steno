import type { TranscriptComparison, TranscriptMistake } from "@/lib/types";

function isWordCharacter(character: string) {
  return /[\p{L}\p{N}]/u.test(character);
}

export function normalizeTranscript(input: string) {
  const normalized = input.normalize("NFKC").toLowerCase();
  let cleaned = "";

  for (const character of normalized) {
    cleaned += isWordCharacter(character) || /\s/u.test(character) ? character : " ";
  }

  return cleaned.split(/\s+/u).filter(Boolean);
}

export function compareTranscripts(
  referenceTranscript: string,
  submittedTranscript: string,
): TranscriptComparison {
  const reference = normalizeTranscript(referenceTranscript);
  const submission = normalizeTranscript(submittedTranscript);

  const rows = reference.length + 1;
  const cols = submission.length + 1;
  const cost: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const move: ("match" | "substitution" | "deletion" | "insertion")[][] =
    Array.from({ length: rows }, () => Array(cols).fill("match"));

  for (let i = 1; i < rows; i += 1) {
    cost[i][0] = i;
    move[i][0] = "deletion";
  }

  for (let j = 1; j < cols; j += 1) {
    cost[0][j] = j;
    move[0][j] = "insertion";
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      if (reference[i - 1] === submission[j - 1]) {
        cost[i][j] = cost[i - 1][j - 1];
        move[i][j] = "match";
        continue;
      }

      const substitutionCost = cost[i - 1][j - 1] + 1;
      const deletionCost = cost[i - 1][j] + 1;
      const insertionCost = cost[i][j - 1] + 1;
      const best = Math.min(substitutionCost, deletionCost, insertionCost);

      cost[i][j] = best;

      if (best === substitutionCost) {
        move[i][j] = "substitution";
      } else if (best === deletionCost) {
        move[i][j] = "deletion";
      } else {
        move[i][j] = "insertion";
      }
    }
  }

  const mistakes: TranscriptMistake[] = [];
  let matchedWords = 0;
  let i = reference.length;
  let j = submission.length;

  while (i > 0 || j > 0) {
    const currentMove = move[i][j];

    if (i > 0 && j > 0 && currentMove === "match") {
      matchedWords += 1;
      i -= 1;
      j -= 1;
      continue;
    }

    if (i > 0 && j > 0 && currentMove === "substitution") {
      mistakes.push({
        type: "substitution",
        expected: reference[i - 1],
        actual: submission[j - 1],
        referenceIndex: i - 1,
        submittedIndex: j - 1,
      });
      i -= 1;
      j -= 1;
      continue;
    }

    if (i > 0 && (j === 0 || currentMove === "deletion")) {
      mistakes.push({
        type: "deletion",
        expected: reference[i - 1],
        referenceIndex: i - 1,
        submittedIndex: j,
      });
      i -= 1;
      continue;
    }

    mistakes.push({
      type: "insertion",
      actual: submission[j - 1],
      referenceIndex: i,
      submittedIndex: j - 1,
    });
    j -= 1;
  }

  mistakes.reverse();

  const denominator = Math.max(reference.length, submission.length, 1);
  const accuracy = Number(((matchedWords / denominator) * 100).toFixed(2));

  return {
    normalizedReference: reference,
    normalizedSubmission: submission,
    matchedWords,
    referenceWordCount: reference.length,
    submittedWordCount: submission.length,
    mistakeCount: mistakes.length,
    accuracy,
    mistakes,
  };
}
