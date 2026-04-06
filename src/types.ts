export interface UserProfile {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Gadget {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  created_at: string;
  updated_at: string;
  author: string;
  expand?: {
    author: UserProfile;
  };
}
