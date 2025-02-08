// Backend/src/common/logger.ts
import fs from 'fs';
import path from 'path';

// All backend logs will be appended to this XML file at the project root.
const logFilePath = path.join(process.cwd(), "logs.xml");

// Helper to escape XML special characters.
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
    return c;
  });
}

function writeLogEntry(entry: string): void {
  // Append the log entry to the file (synchronously for simplicity)
  fs.appendFileSync(logFilePath, entry + "\n", 'utf8');
}

export function logInfo(message: string, source: string): void {
  const entry = `<log level="info" source="${source}"><message>${escapeXml(message)}</message></log>`;
  writeLogEntry(entry);
}

export function logError(message: string, source: string): void {
  const entry = `<log level="error" source="${source}"><message>${escapeXml(message)}</message></log>`;
  writeLogEntry(entry);
}