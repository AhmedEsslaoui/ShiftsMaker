import type { NextApiRequest, NextApiResponse } from 'next';
import { dataCache } from '@/lib/dataCache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Subscribe to sync status updates
  const unsubscribe = dataCache.subscribeSyncStatus((status) => {
    res.write(`data: ${JSON.stringify(status)}\n\n`);
  });

  // Clean up subscription when client disconnects
  req.on('close', () => {
    unsubscribe();
    res.end();
  });
}
