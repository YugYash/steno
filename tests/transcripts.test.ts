import test from "node:test";
import assert from "node:assert/strict";

import { compareTranscripts, normalizeTranscript } from "../src/lib/transcripts.ts";

test("normalizeTranscript removes punctuation and collapses spaces", () => {
  assert.deepEqual(normalizeTranscript("Hello,   WORLD!\nThis is steno."), [
    "hello",
    "world",
    "this",
    "is",
    "steno",
  ]);
});

test("compareTranscripts treats formatting-only changes as a perfect match", () => {
  const result = compareTranscripts(
    "The quick brown fox.",
    "  the QUICK   brown fox ",
  );

  assert.equal(result.accuracy, 100);
  assert.equal(result.mistakeCount, 0);
  assert.equal(result.matchedWords, 4);
});

test("compareTranscripts records substitution, insertion, and deletion mistakes", () => {
  const result = compareTranscripts(
    "the quick brown fox jumps",
    "the quick black fox really",
  );

  assert.equal(result.matchedWords, 3);
  assert.equal(result.mistakeCount, 2);
  assert.deepEqual(
    result.mistakes.map((mistake) => mistake.type),
    ["substitution", "substitution"],
  );
});

test("compareTranscripts flags missing words", () => {
  const result = compareTranscripts("alpha beta gamma", "alpha gamma");

  assert.equal(result.mistakeCount, 1);
  assert.equal(result.mistakes[0]?.type, "deletion");
  assert.equal(result.mistakes[0]?.expected, "beta");
});
