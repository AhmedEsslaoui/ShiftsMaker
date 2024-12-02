import type { NextApiRequest, NextApiResponse } from 'next';
import { dataCache } from '@/lib/dataCache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const shiftTables = await dataCache.getData();
    res.status(200).json({ shiftTables });
  } catch (error: any) {
    console.error('Error loading shift tables:', error);
    res.status(500).json({ message: error.message });
  }
}