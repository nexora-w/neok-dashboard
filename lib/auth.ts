import { cookies } from 'next/headers';
import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  email: string;
  createdAt: Date;
  lastLogin: Date;
  isAllow: boolean;
}

export interface Session {
  _id: ObjectId;
  userId: ObjectId;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

export async function createSession(userId: ObjectId): Promise<string> {
  const db = await getDatabase();
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.collection('sessions').insertOne({
    userId,
    token,
    createdAt: new Date(),
    expiresAt
  });

  return token;
}

export async function getSessionUser(token: string): Promise<User | null> {
  const db = await getDatabase();
  
  const session = await db.collection('sessions').findOne({
    token,
    expiresAt: { $gt: new Date() }
  });

  if (!session) {
    return null;
  }

  const user = await db.collection('users').findOne({
    _id: session.userId
  });

  // If user doesn't exist or is not allowed, return null
  if (!user || !user.isAllow) {
    return null;
  }

  return user as User | null;
}

export async function deleteSession(token: string): Promise<void> {
  const db = await getDatabase();
  await db.collection('sessions').deleteOne({ token });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session-token')?.value;

  if (!token) {
    return null;
  }

  return getSessionUser(token);
}

function generateSessionToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

