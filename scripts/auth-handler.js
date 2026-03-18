// 6. Supabase Initialization
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fzryyzcrfmorkdskjpi.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cnl5emNyZm1yb3JrZHNqa3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzQwODksImV4cCI6MjA4NTcxMDA4OX0.raHv7mabcYzLl74x9cG88wXaFr7gOfLZ6w0KM-iZh08';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Handle Auth Flow in Vanilla JS
 */
async function initAuth() {
  console.log('Initializing Auth Check...');

  // 1. Check if user session exists on page load
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Error fetching session:', error.message);
    return;
  }

  if (session) {
    console.log('Session found for user:', session.user.email);
    // 2. Redirect to dashboard if session exists
    handleRedirect(true, session.user);
  } else {
    console.log('No active session found.');
    // 3. Stay on login page (no action needed or handleRedirect(false))
  }

  // 4. Listen for authentication state changes (Login, SignOut, etc.)
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth Event Triggered:', event);

    if (event === 'SIGNED_IN' && session) {
      console.log('User signed in successfully:', session.user.email);
      handleRedirect(true, session.user);
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out.');
      handleRedirect(false);
    }
  });
}

/**
 * 8. Optional: Fetch and Display Logged-in User Info
 */
function handleRedirect(isAuthenticated, user = null) {
  const isLoginPage =
    window.location.pathname.includes('login.html') ||
    window.location.pathname === '/';

  if (isAuthenticated) {
    console.log('User is authenticated. Redirecting to dashboard...');
    // If we are on the login page, move to dashboard
    if (isLoginPage) {
      window.location.href = '/dashboard.html';
    } else {
      // Already on a protected page, maybe update UI with user info
      updateUI(user);
    }
  } else {
    // If not authenticated and NOT on login page, send them to login
    if (!isLoginPage) {
      window.location.href = '/login.html';
    }
  }
}

function updateUI(user) {
  if (!user) return;
  const userDisplay = document.getElementById('user-email');
  if (userDisplay) {
    userDisplay.innerText = `Logged in as: ${user.email}`;
  }
}

// Start the auth handler
initAuth();
