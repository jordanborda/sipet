import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const signInWithProvider = async (provider: 'google' | 'azure') => {
  // Verificar si venimos de un logout para forzar selección de cuenta
  const urlParams = new URLSearchParams(window.location.search);
  const fromLogout = urlParams.get('logout') === 'true' || localStorage.getItem('force_account_selection') === 'true';
  
  let oauthOptions: any = {
    redirectTo: `${window.location.origin}/auth/callback`,
  };

  // Si es Google y venimos de logout, forzar selección de cuenta
  if (provider === 'google' && fromLogout) {
    console.log('🔄 OAUTH: Forzando selección de cuenta de Google después de logout');
    oauthOptions = {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        prompt: 'select_account',
        access_type: 'offline'
      }
    };
    
    // Limpiar el flag después de usarlo
    localStorage.removeItem('force_account_selection');
    
    // Limpiar parámetro de URL si existe
    if (urlParams.get('logout') === 'true') {
      window.history.replaceState({}, document.title, '/');
    }
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: oauthOptions,
  })
  
  if (error) {
    console.error('Error during OAuth sign in:', error.message)
    return { error }
  }
  
  return { data }
}

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    console.error('Error during email sign in:', error.message)
    return { error }
  }
  
  return { data }
}

export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/auth/callback?verified=true`,
    },
  })
  
  if (error) {
    console.error('Error during email sign up:', error.message)
    return { error }
  }
  
  return { data }
}

export const resendEmailConfirmation = async (email: string) => {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback?verified=true`,
    },
  })
  
  if (error) {
    console.error('Error resending email confirmation:', error.message)
    return { error }
  }
  
  return { data }
}

export const sendPasswordResetEmail = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  
  if (error) {
    console.error('Error sending password reset email:', error.message)
    return { error }
  }
  
  return { data }
}

export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })
  
  if (error) {
    console.error('Error updating password:', error.message)
    return { error }
  }
  
  return { data }
}