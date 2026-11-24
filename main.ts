import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry: one line of brutally honest software error copy.
// Names the real failure (database fell over, one query never had an
// index), tells the user what to do next (try again in a minute),
// and owns the fix with a shrug.
const ENTRY =
  "Something went wrong, and for once we will say what: our database fell over because one query never had an index. Try again in a minute — the index is added now. Probably.";

const outputDir =
  process.env.MAKEFUN_OUTPUT_DIR || process.env.OUTPUT_DIR || "/output";

function fail(message: string): never {
  throw new Error(`entry validation failed: ${message}`);
}

// Gate: 1-200 characters, a single line, not whitespace-only.
if ([...ENTRY].length < 1 || [...ENTRY].length > 200) {
  fail(`entry must be 1-200 characters, got ${[...ENTRY].length}`);
}
if (ENTRY.trim().length === 0) {
  fail("entry must not be whitespace-only");
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  fail("entry must be a single line");
}
if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(ENTRY)) {
  fail("entry must not contain control characters (only printable text allowed)");
}

mkdirSync(outputDir, { recursive: true });
const outPath = join(outputDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");

// Read back and refuse to pass unless the file is byte-for-byte the entry.
const written = readFileSync(outPath, "utf8");
if (written !== ENTRY) {
  fail("entry.txt does not match the entry text after writing");
}

console.log(ENTRY);
