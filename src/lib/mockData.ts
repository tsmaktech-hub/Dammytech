import { Gadget } from '../types';

export const MOCK_GADGETS: Gadget[] = [
  {
    id: 'mock-1',
    name: 'iPhone 15 Pro Max',
    description: 'The ultimate iPhone with Titanium design, A17 Pro chip, and a powerful camera system.',
    price: 1199.99,
    category: 'phones',
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800',
    author: 'admin',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    expand: {
      author: {
        id: 'admin',
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'Admin User',
        phoneNumber: '1234567890',
        role: 'admin',
        avatar: '',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      }
    }
  },
  {
    id: 'mock-2',
    name: 'MacBook Pro M3 Max',
    description: 'The most powerful laptop for pros. 14-inch Liquid Retina XDR display and incredible battery life.',
    price: 3199.99,
    category: 'laptops',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    author: 'admin',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    expand: {
      author: {
        id: 'admin',
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'Admin User',
        phoneNumber: '1234567890',
        role: 'admin',
        avatar: '',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      }
    }
  },
  {
    id: 'mock-3',
    name: 'Apple Watch Ultra 2',
    description: 'The most rugged and capable Apple Watch. Designed for the outdoors and high-endurance athletes.',
    price: 799.99,
    category: 'watches',
    image: 'https://images.unsplash.com/photo-1544117518-30dd5ff7a986?auto=format&fit=crop&q=80&w=800',
    author: 'admin',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    expand: {
      author: {
        id: 'admin',
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'Admin User',
        phoneNumber: '1234567890',
        role: 'admin',
        avatar: '',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      }
    }
  },
  {
    id: 'mock-4',
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling headphones with exceptional sound quality and comfort.',
    price: 399.99,
    category: 'audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    author: 'admin',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    expand: {
      author: {
        id: 'admin',
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'Admin User',
        phoneNumber: '1234567890',
        role: 'admin',
        avatar: '',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      }
    }
  },
  {
    id: 'mock-5',
    name: 'RTX 4090 Founders Edition',
    description: 'The ultimate GeForce GPU. It brings an enormous leap in performance, efficiency, and AI-powered graphics.',
    price: 1599.99,
    category: 'components',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800',
    author: 'admin',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    expand: {
      author: {
        id: 'admin',
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'Admin User',
        phoneNumber: '1234567890',
        role: 'admin',
        avatar: '',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      }
    }
  },
  {
    id: 'mock-6',
    name: 'iPad Pro M2',
    description: 'Astonishing performance. Incredibly advanced displays. Superfast wireless connectivity.',
    price: 1099.99,
    category: 'laptops',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800',
    author: 'admin',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    expand: {
      author: {
        id: 'admin',
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'Admin User',
        phoneNumber: '1234567890',
        role: 'admin',
        avatar: '',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      }
    }
  }
];
