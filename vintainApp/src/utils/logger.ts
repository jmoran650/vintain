// vintainApp/src/utils/logger.ts

export async function logInfo(message: string, source: string): Promise<void> {
  try {
    await fetch("http://localhost:4000/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        level: "info",
        message,
        source,
      }),
    });
  } catch (error) {
    console.error("Failed to send logInfo to backend:", error);
  }
}

export async function logError(message: string, source: string): Promise<void> {
  try {
    await fetch("http://localhost:4000/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        level: "error",
        message,
        source,
      }),
    });
  } catch (error) {
    console.error("Failed to send logError to backend:", error);
  }
}