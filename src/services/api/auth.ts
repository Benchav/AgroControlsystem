const API_URL = import.meta.env.VITE_API_URL || 'https://twofactor-api.vercel.app/api/auth';

// --- MOCK DATABASE EN LOCALSTORAGE ---
const USERS_KEY = 'agro_mock_users';

const getMockUsers = (): any[] => {
  const usersStr = localStorage.getItem(USERS_KEY);
  return usersStr ? JSON.parse(usersStr) : [];
};

const saveMockUsers = (users: any[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};
// ---------------------------------------

export const requestLogin2FA = async (email: string, password: string) => {
  // 1. Validación en Mock DB
  const users = getMockUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('El usuario no existe.');
  }
  
  // Para un entorno real usamos hashes. Para esta simulación comparamos directo.
  if (user.password !== password) {
    throw new Error('Contraseña incorrecta.');
  }

  // 2. Si pasa la validación local, pedimos al backend el 2FA
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

export const requestRegister = async (name: string, org: string, email: string, password: string) => {
  // 1. Validación en Mock DB
  const users = getMockUsers();
  const exists = users.find(u => u.email === email);
  
  if (exists) {
    throw new Error('El correo electrónico ya está registrado.');
  }

  // Guardamos al usuario en la BD simulada local
  users.push({ name, org, email, password });
  saveMockUsers(users);

  // 2. Llamamos al backend para iniciar el proceso de verificación por correo
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, org, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al registrar la cuenta');
  }

  return response.json();
};

export const verify2FACode = async (email: string, code: string) => {
  // Verificamos el código con el backend real
  const response = await fetch(`${API_URL}/verify-2fa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Código de verificación inválido');
  }

  const data = await response.json();

  // Inyectar los datos reales del usuario desde nuestra Mock DB
  if (data.success && data.user) {
    const users = getMockUsers();
    const localUser = users.find(u => u.email === email);
    
    if (localUser) {
      data.user = {
        id: email, // Usamos el email como ID para la simulación
        name: localUser.name,
        email: localUser.email,
        role: 'admin', // Rol por defecto
        organization: localUser.org
      };
    }
  }

  return data;
};
