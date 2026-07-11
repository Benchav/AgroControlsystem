const API_URL = import.meta.env.VITE_API_URL || 'https://twofactor-api.vercel.app/api/auth';

type MockUser = {
  name: string;
  org: string;
  email: string;
  password: string;
};

const USERS_KEY = 'agro_mock_users';
const PENDING_USERS_KEY = 'agro_mock_pending_users';

const getStoredUsers = (key: string): MockUser[] => {
  const usersStr = localStorage.getItem(key);
  return usersStr ? JSON.parse(usersStr) : [];
};

const saveStoredUsers = (key: string, users: MockUser[]) => {
  localStorage.setItem(key, JSON.stringify(users));
};

const getMockUsers = () => getStoredUsers(USERS_KEY);
const saveMockUsers = (users: MockUser[]) => saveStoredUsers(USERS_KEY, users);
const getPendingUsers = () => getStoredUsers(PENDING_USERS_KEY);
const savePendingUsers = (users: MockUser[]) => saveStoredUsers(PENDING_USERS_KEY, users);

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
  const users = getMockUsers();
  const pendingUsers = getPendingUsers();
  const existsInUsers = users.find(u => u.email === email);
  
  // Solo bloqueamos si el usuario ya verificó su cuenta (está en users)
  if (existsInUsers) {
    throw new Error('El correo electrónico ya está registrado.');
  }

  // Si estaba en pendingUsers, simplemente reescribimos sus datos y reenviamos el 2FA
  const updatedPending = pendingUsers.filter(u => u.email !== email);

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

  savePendingUsers([...updatedPending, { name, org, email, password }]);

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
    throw new Error(errorData.error || 'Código de verificación inválido');
  }

  const data = await response.json();

  if (data.success) {
    const users = getMockUsers();
    const pendingUsers = getPendingUsers();
    const pendingUser = pendingUsers.find((user) => user.email === email);

    if (pendingUser && !users.some((user) => user.email === email)) {
      saveMockUsers([...users, pendingUser]);
      savePendingUsers(pendingUsers.filter((user) => user.email !== email));
    }

    const localUser = [...users, ...(pendingUser ? [pendingUser] : [])].find((user) => user.email === email);
    
    if (localUser) {
      data.user = {
        name: localUser.name,
        email: localUser.email,
        org: localUser.org,
      };
    }
  }

  return data;
};
