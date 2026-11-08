const AUTH_REDIRECT_BASE = 'https://apbjqfkereibpanqppdu.supabase.co/functions/v1/auth-redirect';

export const AUTH_RESET_PASSWORD_URL = `${AUTH_REDIRECT_BASE}?next=reset-password`;
export const AUTH_EMAIL_CONFIRMED_URL = `${AUTH_REDIRECT_BASE}?next=email-confirmed`;
