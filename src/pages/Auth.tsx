import React, { useEffect } from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Auth() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-accent">Meeting</span>
            <span className="text-primary">AI</span>
          </h1>
          <p className="text-text-secondary">Transform your meetings into actionable insights</p>
        </div>
        
        <div className="card p-8">
          <SupabaseAuth 
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#1DB9A6',
                    brandAccent: '#25D4BE',
                    inputBackground: '#1A1F1D',
                    inputText: '#FFFFFF',
                    inputPlaceholder: '#A1A1AA',
                    backgroundSecondary: '#111816',
                  },
                },
              },
              style: {
                button: {
                  borderRadius: '0.5rem',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '10px 15px',
                },
                input: {
                  borderRadius: '0.5rem',
                  fontSize: '14px',
                  padding: '10px 15px',
                },
                anchor: {
                  color: '#1DB9A6',
                },
                message: {
                  color: '#A1A1AA',
                },
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email address',
                  password_label: 'Password',
                },
                sign_up: {
                  email_label: 'Email address',
                  password_label: 'Create a Password',
                },
              },
            }}
            redirectTo={window.location.origin}
            onlyThirdPartyProviders={false}
          />
        </div>
      </div>
    </div>
  );
}