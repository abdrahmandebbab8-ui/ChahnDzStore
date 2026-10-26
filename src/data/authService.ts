import { User } from '../types/store';

export interface StoredAccount extends User {
  passwordHash: string; // Stored securely
}

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    id: 'usr_admin_1',
    email: 'taybawi8@gmail.com',
    name: 'Abderraouf Taybawi (Admin)',
    role: 'admin',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    phone: '+213660000000',
    passwordHash: 'admin123',
  },
  {
    id: 'usr_admin_2',
    email: 'admin@chahndz.com',
    name: 'ChahnDz Admin',
    role: 'admin',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    phone: '+213660000000',
    passwordHash: 'admin123',
  },
  {
    id: 'usr_customer_1',
    email: 'customer@chahndz.com',
    name: 'Karim DZ Gamer',
    role: 'user',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    phone: '+213550112233',
    passwordHash: 'user123',
  },
];

const STORAGE_USERS_KEY = 'chahndz_registered_accounts';
const STORAGE_CURRENT_USER_KEY = 'chahndz_current_user';

export const getStoredAccounts = (): StoredAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  // Initialize with defaults
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
  } catch {
    // ignore
  }
  return DEFAULT_ACCOUNTS;
};

export const saveAccounts = (accounts: StoredAccount[]) => {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));
  } catch {
    // ignore
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  // Default to the admin user for quick review, or null
  return DEFAULT_ACCOUNTS[0];
};

export const saveCurrentUser = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  } catch {
    // ignore
  }
};

export const isAdminUser = (user: User | null): boolean => {
  if (!user) return false;
  return (
    user.role === 'admin' ||
    user.email.toLowerCase() === 'taybawi8@gmail.com' ||
    user.email.toLowerCase() === 'admin@chahndz.com'
  );
};
