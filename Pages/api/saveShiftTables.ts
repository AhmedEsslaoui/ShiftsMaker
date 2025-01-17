import type { NextApiRequest, NextApiResponse } from 'next';
import { dataCache } from '@/lib/dataCache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { shiftTables } = req.body;
    await dataCache.setData(shiftTables);
    
    console.log(' Data saved successfully to Firestore');
    res.status(200).json({ message: 'Shift tables saved successfully' });
  } catch (error: any) {
    console.error('Error saving shift tables:', error);
    res.status(500).json({ message: error.message });
  }
}