const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/auth';

export const requestLogin2FA = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al solicitar el código 2FA');
  }

  return response.json();
};

export const verify2FACode = async (email: string, code: string) => {
  const response = await fetch(`${API_URL}/verify-2fa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al verificar el código 2FA');
  }

  return response.json();
};
