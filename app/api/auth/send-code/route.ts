import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { sendVerificationEmail, generateVerificationCode } from '@/lib/nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, requireExisting = false } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const normalizedEmail = email.toLowerCase();

    // Check if user exists and if they're allowed
    const existingUser = await db.collection('users').findOne({
      email: normalizedEmail
    });

    // For login flow, email must exist in database
    if (requireExisting && !existingUser) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    // If user exists and isAllow is false, prevent sending email
    if (existingUser && existingUser.isAllow === false) {
      return NextResponse.json(
        { error: 'Your account is pending approval. Please contact an administrator.' },
        { status: 403 }
      );
    }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code in database
    await db.collection('verification_codes').insertOne({
      email: normalizedEmail,
      code,
      createdAt: new Date(),
      expiresAt,
      used: false
    });

    // Send email
    await sendVerificationEmail(email, code);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}

