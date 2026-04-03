import PocketBase from 'pocketbase';

const url = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
export const pb = new PocketBase(url);

// Helper to get file URL
export const getFileUrl = (collection: string, recordId: string, fileName: string) => {
  return `${url}/api/files/${collection}/${recordId}/${fileName}`;
};
