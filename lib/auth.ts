import { NextApiRequest } from 'next';
import { User } from '../types/types';
import { mockUsers } from '../data/mockData';

// Mock user passwords - in a real app, passwords would be hashed
const userPasswords: Record<string, string> = {
  'admin@frauddetect.com': 'admin123',
  'user1@example.com': 'password1'
};

// Check if running on client or server
const isClient = typeof window !== 'undefined';

// Login function sets user data in localStorage (client-side only)
export async function login(email: string, password: string): Promise<{success: boolean, user?: User, message: string}> {
  // Find user by email
  const user = mockUsers.find(u => u.email === email);
  
  // Check if user exists and password matches
  if (user && userPasswords[email] === password) {
    // Store user in localStorage (client-side only)
    if (isClient) {
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }));
    }
    
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Login successful'
    };
  }
  
  return {
    success: false,
    message: 'Invalid email or password'
  };
}

// Logout function clears user data from localStorage
export async function logout(): Promise<boolean> {
  if (isClient) {
    localStorage.removeItem('user');
  }
  return true;
}

// Get logged in user from localStorage or request cookies
export function getLoggedInUser(req?: NextApiRequest): User | null {
  // On server-side (API routes), get user from cookies
  if (req) {
    // In a real app, you would validate the session/token from cookies
    // For the demo, we'll just return a mock user based on a custom header
    const userEmail = req.headers['x-user-email'] as string;
    
    if (userEmail) {
      const user = mockUsers.find(u => u.email === userEmail);
      if (user) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    }
    
    // Default to admin user for API requests in this demo
    // In a real app, this should return null for unauthenticated requests
    return {
      id: mockUsers[0].id,
      name: mockUsers[0].name,
      email: mockUsers[0].email,
      role: mockUsers[0].role
    };
  }
  
  // On client-side, get user from localStorage
  if (isClient) {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
      }
    }
  }
  
  return null;
}

// Check if current user is an admin
export function isAdmin(): boolean {
  const user = getLoggedInUser();
  return !!user && user.role === 'admin';
} 