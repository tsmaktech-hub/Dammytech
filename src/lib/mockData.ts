import { Gadget } from '../types';

export const MOCK_GADGETS: Gadget[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'iPhone 15 Pro Max',
    description: 'The ultimate iPhone with Titanium design, A17 Pro chip, and a powerful camera system.',
    price: 1850000,
    category: 'phones',
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800',
    author: '11111111-1111-1111-1111-111111111111',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    expand: {
      author: {
        id: '11111111-1111-1111-1111-111111111111',
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
    id: '22222222-2222-2222-2222-222222222222',
    name: 'MacBook Pro M3 Max',
    description: 'The most powerful laptop for pros. 14-inch Liquid Retina XDR display and incredible battery life.',
    price: 4500000,
    category: 'laptops',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    author: '11111111-1111-1111-1111-111111111111',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    expand: {
      author: {
        id: '11111111-1111-1111-1111-111111111111',
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
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Apple Watch Ultra 2',
    description: 'The most rugged and capable Apple Watch. Designed for the outdoors and high-endurance athletes.',
    price: 1200000,
    category: 'watches',
    image: 'https://images.unsplash.com/photo-1544117518-30dd5ff7a986?auto=format&fit=crop&q=80&w=800',
    author: '11111111-1111-1111-1111-111111111111',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    expand: {
      author: {
        id: '11111111-1111-1111-1111-111111111111',
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
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling headphones with exceptional sound quality and comfort.',
    price: 650000,
    category: 'audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    author: '11111111-1111-1111-1111-111111111111',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    expand: {
      author: {
        id: '11111111-1111-1111-1111-111111111111',
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
    id: '55555555-5555-5555-5555-555555555555',
    name: 'RTX 4090 Founders Edition',
    description: 'The ultimate GeForce GPU. It brings an enormous leap in performance, efficiency, and AI-powered graphics.',
    price: 3200000,
    category: 'components',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800',
    author: '11111111-1111-1111-1111-111111111111',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    expand: {
      author: {
        id: '11111111-1111-1111-1111-111111111111',
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
    id: '66666666-6666-6666-6666-666666666666',
    name: 'iPad Pro M2',
    description: 'Astonishing performance. Incredibly advanced displays. Superfast wireless connectivity.',
    price: 1450000,
    category: 'laptops',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800',
    author: '11111111-1111-1111-1111-111111111111',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    expand: {
      author: {
        id: '11111111-1111-1111-1111-111111111111',
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
