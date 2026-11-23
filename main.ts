import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

// The entry: one line, kept exactly as written.
const ENTRY = "The demo crashed, so my agent force-pushed an apology to main.";

const MAX_CODE_POINTS = 280;
const SHOW_FLAG = "--show";

function fail(message: string): never {
  process.stderr.write(`main.ts: ${message}\n`);
  process.exit(1);
}

function codePointCount(text: string): number {
  return Array.from(text).length;
}

function outputDirectory(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  return fromEnv !== undefined && fromEnv !== "" ? fromEnv : "/output";
}

function show(): void {
  process.stdout.write(`${ENTRY}\n`);
}

function writeEntry(): void {
  if (ENTRY.trim() === "") {
    fail("entry text is empty or only white space; nothing to write");
  }

  const entryCodePoints = codePointCount(ENTRY);
  if (entryCodePoints > MAX_CODE_POINTS) {
    fail(
      `entry text is ${entryCodePoints} code points, over the ${MAX_CODE_POINTS} limit`,
    );
  }

  const directory = outputDirectory();
  mkdirSync(directory, { recursive: true });

  const target = join(directory, "entry.txt");
  const bytes = Buffer.from(`${ENTRY}\n`, "utf8");
  writeFileSync(target, bytes);

  const readBack = readFileSync(target);
  if (!readBack.equals(bytes)) {
    fail(`read-back mismatch: ${target} does not hold the bytes written`);
  }

  const digest = createHash("sha256").update(readBack).digest("hex");

  process.stdout.write(`wrote ${target}\n`);
  process.stdout.write(
    `code points: ${codePointCount(readBack.toString("utf8"))}\n`,
  );
  process.stdout.write(`bytes: ${readBack.length}\n`);
  process.stdout.write(`sha256: ${digest}\n`);
}

if (process.argv.slice(2).includes(SHOW_FLAG)) {
  show();
} else {
  writeEntry();
}
