import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { createSession } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { getClientIP } from '@/lib/utils';

// Validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  console.log(`[LOGIN] Attempt from IP: ${clientIP}`);
  
  try {
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { username }
    });

    // Verify password (check even if user doesn't exist to prevent timing attacks)
    let isValidPassword = false;
    if (user) {
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
    } else {
      // Perform dummy hash comparison to prevent timing attacks
      await bcrypt.compare(password, '$2b$12$dummy.hash.to.prevent.timing.attacks');
    }

    // Handle invalid credentials
    if (!user || !isValidPassword) {
      console.log(`[LOGIN] Failed login attempt - Username: ${username}, IP: ${clientIP}`);
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Success - create session
    await createSession(user.id, user.username);
    console.log(`[LOGIN] Successful login - User: ${user.username} (${user.id}), IP: ${clientIP}`);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username
      }
    });

  } catch (error) {
    console.error(`[LOGIN] Error from IP ${clientIP}:`, error);
    
    if (error instanceof z.ZodError) {
      console.log(`[LOGIN] Validation error from IP ${clientIP}:`, error.issues);
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}