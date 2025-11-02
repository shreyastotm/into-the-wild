// Quick fix script for authentication redirect issues
// Run this in browser console after clearing sessions

console.log("🔧 Running authentication redirect fix...");

// Clear all auth sessions
const clearSessions = () => {
  const localKeys = Object.keys(localStorage);
  const authKeys = localKeys.filter(
    (key) =>
      key.includes("supabase") ||
      key.includes("auth") ||
      key.includes("itw-auth"),
  );

  authKeys.forEach((key) => {
    console.log(`Removing: ${key}`);
    localStorage.removeItem(key);
  });

  const sessionKeys = Object.keys(sessionStorage);
  const sessionAuthKeys = sessionKeys.filter(
    (key) =>
      key.includes("supabase") ||
      key.includes("auth") ||
      key.includes("itw-auth"),
  );

  sessionAuthKeys.forEach((key) => {
    console.log(`Removing: ${key}`);
    sessionStorage.removeItem(key);
  });

  // Clear cookies
  const cookies = document.cookie.split(";");
  const authCookies = cookies.filter(
    (cookie) =>
      cookie.toLowerCase().includes("supabase") ||
      cookie.toLowerCase().includes("auth"),
  );

  authCookies.forEach((cookie) => {
    const cookieName = cookie.split("=")[0].trim();
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    console.log(`Removing cookie: ${cookieName}`);
  });

  console.log("✅ All sessions cleared!");
};

// Clear sessions and reload
clearSessions();
console.log("🔄 Reloading page...");
setTimeout(() => {
  window.location.reload();
}, 1000);
