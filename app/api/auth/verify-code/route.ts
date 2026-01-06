import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { createSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const normalizedEmail = email.toLowerCase();

    // Find valid verification code
    const verification = await db.collection('verification_codes').findOne({
      email: normalizedEmail,
      code,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Mark code as used
    await db.collection('verification_codes').updateOne(
      { _id: verification._id },
      { $set: { used: true } }
    );

    // Find or create user
    let user = await db.collection('users').findOne({
      email: normalizedEmail
    });

    if (!user) {
      const result = await db.collection('users').insertOne({
        email: normalizedEmail,
        createdAt: new Date(),
        lastLogin: new Date(),
        isAllow: false
      });
      user = {
        _id: result.insertedId,
        email: normalizedEmail,
        createdAt: new Date(),
        lastLogin: new Date(),
        isAllow: false
      };
    } else {
      // Update last login
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date() } }
      );
    }

    // Check if user is allowed to login (for both new and existing users)
    if (!user.isAllow) {
      return NextResponse.json(
        { error: 'Your account is pending approval. Please contact an administrator.' },
        { status: 403 }
      );
    }

    // Create session
    const sessionToken = await createSession(user._id);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user._id,
        email: user.email,
        isAllow: user.isAllow
      }
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}

