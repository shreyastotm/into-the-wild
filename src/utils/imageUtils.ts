/**
 * Utility functions for image conversion
 * Handles base64 data URL to Blob/File conversion without using fetch (to avoid CSP violations)
 */

/**
 * Converts a base64 data URL to a Blob
 * @param base64 - Base64 data URL (e.g., "data:image/jpeg;base64,/9j/4AAQ...")
 * @returns Blob object
 */
export function base64ToBlob(base64: string): Blob {
  // Extract MIME type and base64 data
  const matches = base64.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 data URL");
  }
  const mimeType = matches[1] || "image/jpeg";
  const base64Data = matches[2];

  // Convert base64 to binary
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  return new Blob([byteArray], { type: mimeType });
}

/**
 * Converts a base64 data URL to a File
 * @param base64 - Base64 data URL
 * @param filename - Name for the file
 * @returns File object
 */
export function base64ToFile(base64: string, filename: string): File {
  const blob = base64ToBlob(base64);
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}
