import { NextApiRequest, NextApiResponse } from 'next';
import { SocketHandler } from '@/lib/socketServer';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    SocketHandler(req, res);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}