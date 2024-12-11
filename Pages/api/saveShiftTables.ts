import type { NextApiRequest, NextApiResponse } from 'next';
import { dataCache } from '@/lib/dataCache';

const FOLDER_ID = '1zEkMxW-86VFzrU26LXl-VpJNxlTnpbaf';
const FILE_NAME = 'shiftTables.json';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { shiftTables } = req.body;
    await dataCache.setData(shiftTables);
    
    console.log(' Data saved successfully to Google Drive');
    res.status(200).json({ message: 'Shift tables saved successfully' });
  } catch (error: any) {
    console.error('Error saving shift tables:', error);
    res.status(500).json({ message: error.message });
  }
}