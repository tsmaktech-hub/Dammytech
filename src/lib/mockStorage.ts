// Mock storage for local development
const STORAGE_KEY = 'gadget-store-mock-data';

interface MockData {
  users: any[];
  gadgets: any[];
  currentUser: any | null;
  savedCredentials: Record<string, any>;
}

const initialData: MockData = {
  users: [],
  gadgets: [],
  currentUser: null,
  savedCredentials: {}
};

const getStorageData = (): MockData => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : initialData;
};

const saveStorageData = (data: MockData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const mockStorage = {
  getUsers: () => getStorageData().users,
  saveUser: (user: any) => {
    const data = getStorageData();
    data.users.push(user);
    saveStorageData(data);
  },
  getUserById: (id: string) => getStorageData().users.find(u => u.id === id),
  getCurrentUser: () => getStorageData().currentUser,
  setCurrentUser: (user: any | null) => {
    const data = getStorageData();
    data.currentUser = user;
    saveStorageData(data);
  },
  getSavedCredentials: (deviceId: string) => getStorageData().savedCredentials[deviceId],
  saveCredentials: (deviceId: string, creds: any) => {
    const data = getStorageData();
    data.savedCredentials[deviceId] = creds;
    saveStorageData(data);
  },
  getGadgets: () => getStorageData().gadgets,
  saveGadget: (gadget: any) => {
    const data = getStorageData();
    const index = data.gadgets.findIndex(g => g.id === gadget.id);
    if (index >= 0) {
      data.gadgets[index] = gadget;
    } else {
      data.gadgets.push(gadget);
    }
    saveStorageData(data);
  },
  deleteGadget: (id: string) => {
    const data = getStorageData();
    data.gadgets = data.gadgets.filter(g => g.id !== id);
    saveStorageData(data);
  },
  resetDatabase: () => {
    saveStorageData(initialData);
    window.location.reload();
  }
};
