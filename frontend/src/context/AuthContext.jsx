import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api, setStoredAuthToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check initial authentication
  useEffect(() => {
    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            setStoredAuthToken(session.access_token);
            const profile = await api.getMe().catch(() => null);
            setUser(profile || {
              id: session.user.id,
              supabase_id: session.user.id,
              email: session.user.email,
              username: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
              avatar_url: session.user.user_metadata?.avatar_url,
              is_google: session.user.app_metadata?.provider === 'google' || !session.user.app_metadata?.provider || true,
              has_password: false
            });
            setLoading(false);
            return;
          }
        }

        const profile = await api.getMe().catch(() => null);
        setUser(profile);
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.access_token) {
          setStoredAuthToken(session.access_token);
          const profile = await api.getMe().catch(() => null);
          setUser(profile || {
            id: session.user.id,
            supabase_id: session.user.id,
            email: session.user.email,
            username: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url,
            is_google: session.user.app_metadata?.provider === 'google' || !session.user.app_metadata?.provider || true,
            has_password: false
          });
        } else if (event === 'SIGNED_OUT') {
          setStoredAuthToken('');
          setUser(null);
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  const signInWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (error) {
          throw error;
        }
        return data;
      } catch (e) {
        console.warn('Supabase Google OAuth error:', e);
        throw e;
      }
    }
    throw new Error('SUPABASE_OAUTH_NOT_CONFIGURED');
  };

  const signInWithGoogleDirect = async (googleProfile) => {
    const res = await api.googleLogin(googleProfile);
    setUser(res);
    return res;
  };

  const signInWithEmail = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (!error && data.session) {
          setStoredAuthToken(data.session.access_token);
          const profile = await api.getMe().catch(() => null);
          setUser(profile || { email, username: email.split('@')[0] });
          return;
        }
      } catch (sbErr) {
        console.warn('Supabase email login fell back to local API:', sbErr);
      }
    }

    const res = await api.login(email, password);
    setUser(res);
  };

  const signUpWithEmail = async (email, password, username) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: username || email.split('@')[0]
            }
          }
        });
        if (!error && data.session) {
          setStoredAuthToken(data.session.access_token);
          const profile = await api.getMe().catch(() => null);
          setUser(profile || { email, username });
          return;
        }
      } catch (sbErr) {
        console.warn('Supabase signup fell back to local API:', sbErr);
      }
    }

    const res = await api.register(email, password, username);
    setUser(res);
  };

  const signInDemo = async () => {
    const demoUserObj = {
      id: 2,
      username: "Alex Rivera",
      email: "demo@expensetracker.local",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop",
      is_google: false,
      has_password: true
    };
    setStoredAuthToken("demo_token");
    localStorage.setItem('expense_tracker_demo_mode', 'true');
    setUser(demoUserObj);

    api.demoLogin().then((res) => {
      if (res) {
        if (res.token) setStoredAuthToken(res.token);
        setUser(res);
      }
    }).catch((err) => {
      console.warn("Backend demo login fallback:", err);
    });

    return demoUserObj;
  };

  const updateLocalUser = (updatedFields) => {
    setUser((prev) => ({
      ...prev,
      ...updatedFields
    }));
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    await api.logout().catch(() => {});
    setStoredAuthToken('');
    localStorage.removeItem('expense_tracker_demo_mode');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithGoogleDirect,
        signInWithEmail,
        signUpWithEmail,
        signInDemo,
        updateLocalUser,
        signOut,
        isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
