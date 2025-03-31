import { NextApiRequest, NextApiResponse } from 'next';
import { analyzeExcelStructure } from '../../lib/excelDataLoader';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const structure = await analyzeExcelStructure();
    res.status(200).json({ success: true, data: structure });
  } catch (error) {
    console.error('Error analyzing Excel structure:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze Excel file' });
  }
} 