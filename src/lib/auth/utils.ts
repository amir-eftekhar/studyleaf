import jwt from 'jsonwebtoken';

export function signJWT(payload: any, options?: jwt.SignOptions) {
  const secret = process.env.JWT_SECRET!;
  const token = jwt.sign(payload, secret, {
    ...(options && options),
  });
  return token;
}

export function verifyJWT<T>(token: string): T | null {
  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as T;
    return decoded;
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return null;
  }
} 