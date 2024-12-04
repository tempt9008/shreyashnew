import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uqsfeexvwodgetgpoizx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxc2ZlZXh2d29kZ2V0Z3BvaXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4ODkxODAsImV4cCI6MjA0ODQ2NTE4MH0.sEv01mtkiBuZ7KyUQ9e1IDmFtMxVWzPwvbyFsueoRTA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    }
  }
});

// Initialize auth state from localStorage
const initializeAuth = async () => {
  try {
    const session = localStorage.getItem('supabase.auth.token');
    if (session) {
      const { access_token } = JSON.parse(session);
      await supabase.auth.setSession({
        access_token,
        refresh_token: '',
      });
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  }
};

initializeAuth();
