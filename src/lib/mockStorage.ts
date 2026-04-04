import { UserProfile, Gadget } from '../types';
import { MOCK_GADGETS } from './mockData';

const isBrowser = typeof window !== 'undefined';

const USERS_KEY = 'mock_users';
const GADGETS_KEY = 'mock_gadgets';

// Initialize gadgets in localStorage if not present
if (isBrowser && !localStorage.getItem(GADGETS_KEY)) {
  localStorage.setItem(GADGETS_KEY, JSON.stringify(MOCK_GADGETS));
}

// Initialize users in localStorage if not present (with default admin)
if (isBrowser) {
  const existingUsers = localStorage.getItem(USERS_KEY);
  let users: UserProfile[] = existingUsers ? JSON.parse(existingUsers) : [];
  
  const defaultAdmin: UserProfile = {
    id: 'admin',
    username: 'admin',
    email: 'admin@example.com',
    fullName: 'Admin User',
    phoneNumber: '1234567890',
    role: 'admin',
    avatar: '',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
  
  const dammyAdmin: UserProfile = {
    id: 'dammy-admin',
    username: 'Dammy',
    email: 'dammystore@gmail.com',
    fullName: 'Ismail Dammy',
    phoneNumber: '09071498194',
    role: 'admin',
    avatar: '',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  // Add or update default admin
  const adminIndex = users.findIndex(u => u.username === 'admin');
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

let currentMockUser: UserProfile | null = null;

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
    return currentMockUser;
  },
  
  setCurrentUser: (user: UserProfile | null) => {
    currentMockUser = user;
    if (isBrowser) {
      window.dispatchEvent(new Event('mock-auth-change'));
    }
  }
};
