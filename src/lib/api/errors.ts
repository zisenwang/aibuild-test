import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: string[] | any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export function handleApiError(error: unknown, context?: string): NextResponse {
  console.error(`[API Error${context ? ` - ${context}` : ''}]:`, error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        ...(error.details && { details: error.details })
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Duplicate data found. Use overwrite option to update existing data.' },
        { status: 409 }
      );
    }
  }

  // Handle unexpected errors
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}