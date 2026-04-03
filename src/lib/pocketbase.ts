import PocketBase from 'pocketbase';

const url = import.meta.env.VITE_POCKETBASE_URL || 'YOUR_POCKETBASE_URL';
export const pb = new PocketBase(url);

// Helper to get file URL
export const getFileUrl = (collection: string, recordId: string, fileName: string) => {
  return `${url}/api/files/${collection}/${recordId}/${fileName}`;
};
