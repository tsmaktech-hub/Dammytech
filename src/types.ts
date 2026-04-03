export interface UserProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  avatar?: string;
  created: string;
  updated: string;
}

export interface Gadget {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  created: string;
  updated: string;
  author: string;
  expand?: {
    author: UserProfile;
  };
}
