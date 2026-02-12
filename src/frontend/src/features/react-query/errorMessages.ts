export function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('unauthorized')) {
      return 'You do not have permission to perform this action.';
    }

    if (message.includes('not found')) {
      return 'The requested resource was not found.';
    }

    if (message.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
