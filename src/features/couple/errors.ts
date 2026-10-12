const messages: Record<string, string> = {
  invalid_code: 'Ese código no existe. Revisa que esté bien escrito.',
  couple_full: 'Esa pareja ya tiene a sus dos integrantes.',
  already_in_couple: 'Ya formas parte de una pareja.',
};

const fallback = 'No se pudo completar la acción. Revisa tu conexión e inténtalo de nuevo.';

export function getCoupleErrorMessage(error: unknown) {
  if (error instanceof Object && 'message' in error && typeof error.message === 'string') {
    return messages[error.message] ?? fallback;
  }
  return fallback;
}
