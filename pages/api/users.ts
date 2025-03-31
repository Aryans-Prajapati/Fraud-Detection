import type { NextApiRequest, NextApiResponse } from 'next';
import { getLoggedInUser } from '../../lib/auth';
import { mockUsers } from '../../data/mockData';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the current user
    const currentUser = getLoggedInUser(req);
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Only admin users can see all users
    if (currentUser.role !== 'admin' && !req.query.id && !req.query.email) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Return single user by ID if specified
    if (req.query.id) {
      const userId = req.query.id as string;
      const user = mockUsers.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Regular users can only see their own data
      if (currentUser.role !== 'admin' && currentUser.id !== user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      return res.status(200).json(user);
    }
    
    // Return single user by email if specified
    if (req.query.email) {
      const userEmail = req.query.email as string;
      const user = mockUsers.find(u => u.email === userEmail);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Regular users can only see their own data
      if (currentUser.role !== 'admin' && currentUser.email !== user.email) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      return res.status(200).json(user);
    }
    
    // Return all users (for admin only)
    return res.status(200).json(mockUsers);
  } catch (error) {
    console.error('Error in users API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 