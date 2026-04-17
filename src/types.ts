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
  created_at: any;
  updated_at: any;
  author: string;
  expand?: {
    author: UserProfile;
  };
}

export interface Order {
  id: string;
  gadget_id: string;
  user_id: string;
  status: 'ordered' | 'delivered';
  created_at: any;
  updated_at: any;
  user_name: string;
  gadget_name: string;
  gadget_image: string;
}
