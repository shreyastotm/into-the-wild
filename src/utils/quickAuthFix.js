// Quick fix script for authentication issues
// Run this in the browser console to clear all auth sessions

(function clearAuthSessions() {
  console.log('🧹 Clearing all authentication sessions...');

  // Clear localStorage
  const localKeys = Object.keys(localStorage);
  const authKeys = localKeys.filter(key =>
    key.includes('supabase') ||
    key.includes('auth') ||
    key.includes('itw-auth')
  );

  authKeys.forEach(key => {
    console.log(`Removing localStorage key: ${key}`);
    localStorage.removeItem(key);
  });

  // Clear sessionStorage
  const sessionKeys = Object.keys(sessionStorage);
  const sessionAuthKeys = sessionKeys.filter(key =>
    key.includes('supabase') ||
    key.includes('auth') ||
    key.includes('itw-auth')
  );

  sessionAuthKeys.forEach(key => {
    console.log(`Removing sessionStorage key: ${key}`);
    sessionStorage.removeItem(key);
  });

  // Clear cookies
  const cookies = document.cookie.split(';');
  const authCookies = cookies.filter(cookie =>
    cookie.toLowerCase().includes('supabase') ||
    cookie.toLowerCase().includes('auth')
  );

  authCookies.forEach(cookie => {
    const cookieName = cookie.split('=')[0].trim();
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    console.log(`Removing cookie: ${cookieName}`);
  });

  console.log('✅ Authentication sessions cleared!');
  console.log('🔄 Refreshing page...');

  // Refresh the page
  setTimeout(() => {
    window.location.reload();
  }, 1000);
})();
