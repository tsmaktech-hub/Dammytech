export interface UserProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  avatar?: string;
}

export interface Gadget {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  created: string;
  author: string;
  expand?: {
    author: UserProfile;
  };
}
