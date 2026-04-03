import { UserProfile, Gadget } from '../types';
import { MOCK_GADGETS } from './mockData';

const USERS_KEY = 'mock_users';
const GADGETS_KEY = 'mock_gadgets';

// Initialize gadgets in localStorage if not present
if (!localStorage.getItem(GADGETS_KEY)) {
  localStorage.setItem(GADGETS_KEY, JSON.stringify(MOCK_GADGETS));
}

// Initialize users in localStorage if not present (with default admin)
if (!localStorage.getItem(USERS_KEY)) {
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
  localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
}

export const mockStorage = {
  getUsers: (): UserProfile[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveUser: (user: UserProfile) => {
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
    const data = localStorage.getItem(GADGETS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveGadget: (gadget: Gadget) => {
    const gadgets = mockStorage.getGadgets();
    const index = gadgets.findIndex(g => g.id === gadget.id);
    if (index >= 0) {
      gadgets[index] = gadget;
    } else {
      gadgets.push(gadget);
    }
    localStorage.setItem(GADGETS_KEY, JSON.stringify(gadgets));
  }
};
