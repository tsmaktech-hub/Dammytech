import { UserProfile, Gadget } from '../types';
import { MOCK_GADGETS } from './mockData';

const isBrowser = typeof window !== 'undefined';

const USERS_KEY = 'mock_users';
const GADGETS_KEY = 'mock_gadgets';
const CURRENT_USER_KEY = 'mock_current_user';

// Initialize gadgets in localStorage if not present
if (isBrowser && !localStorage.getItem(GADGETS_KEY)) {
  localStorage.setItem(GADGETS_KEY, JSON.stringify(MOCK_GADGETS));
}

// Initialize users in localStorage if not present (with default admin)
if (isBrowser) {
  const existingUsers = localStorage.getItem(USERS_KEY);
  let users: UserProfile[] = existingUsers ? JSON.parse(existingUsers) : [];
  
  const defaultAdmin: UserProfile & { password?: string } = {
    id: '11111111-1111-1111-1111-111111111111', // Valid UUID format
    username: 'admin',
    email: 'admin@example.com',
    fullName: 'Admin User',
    phoneNumber: '1234567890',
    role: 'admin',
    avatar: '',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    password: 'password',
  };
  
  const dammyAdmin: UserProfile & { password?: string } = {
    id: '00000000-0000-0000-0000-000000000000', // Valid UUID format
    username: 'Dammy',
    email: 'dammystore@gmail.com',
    fullName: 'Ismail Dammy',
    phoneNumber: '09071498194',
    role: 'admin',
    avatar: '',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    password: 'Broismail',
  };

  // Add or update default admin
  const adminIndex = users.findIndex(u => u.username === 'admin' || u.id === 'admin');
  if (adminIndex >= 0) {
    users[adminIndex] = { ...users[adminIndex], ...defaultAdmin };
  } else {
    users.push(defaultAdmin);
  }
  
  // Add or update Dammy
  const dammyIndex = users.findIndex(u => u.username === 'Dammy');
  if (dammyIndex >= 0) {
    users[dammyIndex] = { ...users[dammyIndex], ...dammyAdmin };
  } else {
    users.push(dammyAdmin);
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const mockStorage = {
  getUsers: (): UserProfile[] => {
    if (!isBrowser) return [];
    try {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error parsing mock users:', e);
      return [];
    }
  },
  
  saveUser: (user: UserProfile) => {
    if (!isBrowser) return;
    const users = mockStorage.getUsers();
    const index = users.findIndex(u => u.id === user.id || u.email === user.email);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },
  
  getUserByEmail: (email: string): UserProfile | undefined => {
    return mockStorage.getUsers().find(u => u.email === email);
  },
  
  getUserById: (id: string): UserProfile | undefined => {
    return mockStorage.getUsers().find(u => u.id === id);
  },
  
  getGadgets: (): Gadget[] => {
    if (!isBrowser) return [];
    try {
      const data = localStorage.getItem(GADGETS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error parsing mock gadgets:', e);
      return [];
    }
  },
  
  saveGadget: (gadget: Gadget) => {
    if (!isBrowser) return;
    const gadgets = mockStorage.getGadgets();
    const index = gadgets.findIndex(g => g.id === gadget.id);
    if (index >= 0) {
      gadgets[index] = gadget;
    } else {
      gadgets.push(gadget);
    }
    localStorage.setItem(GADGETS_KEY, JSON.stringify(gadgets));
  },
  
  deleteGadget: (id: string) => {
    if (!isBrowser) return;
    const gadgets = mockStorage.getGadgets();
    const updated = gadgets.filter(g => g.id !== id);
    localStorage.setItem(GADGETS_KEY, JSON.stringify(updated));
  },
  
  getCurrentUser: (): UserProfile | null => {
    if (!isBrowser) return null;
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  
  setCurrentUser: (user: UserProfile | null) => {
    if (isBrowser) {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
      window.dispatchEvent(new Event('mock-auth-change'));
    }
  },

  resetDatabase: () => {
    if (!isBrowser) return;
    
    // Get current users to find Dammy
    const users = mockStorage.getUsers();
    const dammy = users.find(u => u.username.toLowerCase() === 'dammy');
    const admin = users.find(u => u.username.toLowerCase() === 'admin');
    
    // Keep only Dammy and default admin
    const keepers = [];
    if (dammy) keepers.push(dammy);
    if (admin) keepers.push(admin);
    
    localStorage.setItem(USERS_KEY, JSON.stringify(keepers));
    localStorage.setItem(GADGETS_KEY, JSON.stringify(MOCK_GADGETS));
    localStorage.removeItem(CURRENT_USER_KEY);
    
    window.dispatchEvent(new Event('mock-auth-change'));
    window.dispatchEvent(new Event('mock-gadgets-updated'));
  }
};
