// Authentication Service using Supabase Auth (Google OAuth & Email support)
import { supabase } from './supabaseClient.js';

class AuthService {
  constructor() {
    this.user = null;
    this.profile = null;
    this.listeners = [];
    this.loading = true;
    this.init();
  }

  async init() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        this.user = session.user;
        await this.loadProfile(session.user.id);
      } else {
        const devUser = localStorage.getItem('sse_dev_google_user');
        if (devUser) {
          try {
            const parsed = JSON.parse(devUser);
            this.user = parsed;
            await this.loadProfile(parsed.id);
          } catch (_) {}
        }
      }
    } catch (err) {
      console.warn('Error checking existing Supabase session:', err);
    } finally {
      this.loading = false;
      this.notify();
    }

    // Subscribe to auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        this.user = session.user;
        await this.loadProfile(session.user.id);
      } else {
        this.user = null;
        this.profile = null;
      }
      this.loading = false;
      this.notify();
    });
  }

  async loadProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        this.profile = data;
      } else if (this.user) {
        // Fallback profile if row is not yet created by DB trigger
        const meta = this.user.user_metadata || {};
        const fallbackName = meta.full_name || meta.name || (this.user.email ? this.user.email.split('@')[0] : 'Student');
        const fallbackAvatar = meta.avatar_url || meta.picture || '';
        const rollId = 'SSE-26-' + (this.user.id.slice(0, 4).toUpperCase());

        const newProfile = {
          id: this.user.id,
          full_name: fallbackName,
          email: this.user.email,
          avatar_url: fallbackAvatar,
          roll_id: rollId,
          role: 'student'
        };

        const { data: inserted } = await supabase
          .from('profiles')
          .upsert(newProfile)
          .select()
          .maybeSingle();

        this.profile = inserted || newProfile;
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  }

  getCurrentUser() {
    if (!this.user) return null;
    const meta = this.user.user_metadata || {};
    return {
      id: this.user.id,
      email: this.user.email || '',
      fullName: this.profile?.full_name || meta.full_name || meta.name || 'Student',
      avatarUrl: this.profile?.avatar_url || meta.avatar_url || meta.picture || '',
      rollId: this.profile?.roll_id || ('SSE-26-' + this.user.id.slice(0, 4).toUpperCase()),
      phone: this.profile?.phone || meta.phone || '',
      role: this.profile?.role || 'student'
    };
  }

  isAuthenticated() {
    return !!this.user;
  }

  // 1. Google OAuth Sign-In
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true
        }
      });
      if (error) throw error;

      if (data?.url) {
        // Pre-flight check to verify if Google OAuth is enabled in Supabase
        // Prevents browser from redirecting to raw 400 JSON screen
        try {
          const checkRes = await fetch(data.url, { method: 'GET' });
          if (!checkRes.ok) {
            const errData = await checkRes.json().catch(() => null);
            if (errData && (errData.msg?.includes('provider is not enabled') || errData.code === 400)) {
              return {
                success: false,
                providerNotEnabled: true,
                error: 'Google provider is not enabled in your Supabase project yet.'
              };
            }
          }
        } catch (_) {
          // If fetch is blocked by CORS/network, proceed with redirect
        }

        // Provider is active -> perform redirect to Google Accounts
        window.location.href = data.url;
        return { success: true, data };
      }

      return { success: false, error: 'Failed to generate Google Sign-In URL' };
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      return { success: false, error: err.message || 'Google sign-in failed' };
    }
  }

  // 1b. Dev / Local Google Session (For testing when Google Cloud credentials are pending)
  async startDevGoogleSession() {
    const testUser = {
      id: 'usr_google_student_2026',
      email: 'student.kumar@gmail.com',
      user_metadata: {
        full_name: 'Aman Kumar (Verified Google Student)',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
      }
    };
    this.user = testUser;
    this.profile = {
      id: testUser.id,
      full_name: testUser.user_metadata.full_name,
      email: testUser.email,
      avatar_url: testUser.user_metadata.avatar_url,
      roll_id: 'SSE-26-G849',
      role: 'student'
    };
    try {
      localStorage.setItem('sse_dev_google_user', JSON.stringify(testUser));
    } catch (_) {}
    this.notify();
    return { success: true, user: this.getCurrentUser() };
  }

  // 2. Email Magic Link / OTP Sign-In
  async signInWithOtp(email) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('OTP Sign-In Error:', err);
      return { success: false, error: err.message };
    }
  }

  // 3. Email & Password Sign-In
  async signInWithPassword(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Password Sign-In Error:', err);
      return { success: false, error: err.message };
    }
  }

  // 4. Email & Password Sign-Up
  async signUp(email, password, fullName) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            name: fullName
          }
        }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Sign-Up Error:', err);
      return { success: false, error: err.message };
    }
  }

  // 5. Sign Out
  async signOut() {
    try {
      await supabase.auth.signOut();
      this.user = null;
      this.profile = null;
      try { localStorage.removeItem('sse_dev_google_user'); } catch (_) {}
      this.notify();
      return { success: true };
    } catch (err) {
      console.error('Sign Out Error:', err);
      return { success: false, error: err.message };
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    // Call immediately with current state
    try { listener(this.getCurrentUser(), this.loading); } catch (_) {}
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    const user = this.getCurrentUser();
    this.listeners.forEach(fn => {
      try { fn(user, this.loading); } catch (err) { console.error('Auth listener err:', err); }
    });
  }
}

export const authService = new AuthService();
