import { isAuthError } from '@supabase/supabase-js';

const messages: Record<string, string> = {
  invalid_credentials:
    'El correo o la contraseña no son correctos. Revísalos e inténtalo de nuevo.',
  email_not_confirmed: 'Tu correo aún no está confirmado. Revisa tu bandeja de entrada.',
  user_already_exists: 'Ya existe una cuenta con este correo. Inicia sesión.',
  weak_password: 'La contraseña es muy corta. Usa al menos 6 caracteres.',
  email_address_invalid: 'El correo no es válido. Revísalo e inténtalo de nuevo.',
  same_password: 'La nueva contraseña debe ser distinta a la actual.',
  email_exists: 'Ese correo ya está en uso. Prueba con otro.',
  session_not_found: 'Tu sesión de recuperación expiró. Pide un enlace nuevo e inténtalo de nuevo.',
  otp_expired: 'Este enlace ya no es válido. Pide uno nuevo e inténtalo de nuevo.',
  flow_state_expired: 'Este enlace ya no es válido. Pide uno nuevo e inténtalo de nuevo.',
  over_email_send_rate_limit:
    'Se enviaron demasiados correos. Espera unos minutos e inténtalo de nuevo.',
  over_request_rate_limit: 'Hiciste demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
};

const fallback = 'Algo salió mal. Revisa tu conexión e inténtalo de nuevo.';

export function getAuthErrorMessage(error: unknown) {
  if (isAuthError(error)) {
    if (error.code && messages[error.code]) {
      return messages[error.code];
    }
    const message = error.message.toLowerCase();
    if (message.includes('session')) {
      return messages.session_not_found;
    }
  }
  return fallback;
}
