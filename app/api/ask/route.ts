import { NextRequest, NextResponse } from 'next/server';
import { processHospitalQuestion } from '@/lib/assistant';
import { Language } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, language, roomNumber } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question is required and must be non-empty text.' },
        { status: 400 }
      );
    }

    const lang: Language = language === 'hi' ? 'hi' : 'en';
    const room = typeof roomNumber === 'string' && roomNumber.trim().length > 0
      ? roomNumber.trim()
      : 'Room 402';

    const response = await processHospitalQuestion(question.trim(), lang, room);
    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error processing question';
    console.error('Error in /api/ask:', err);
    return NextResponse.json(
      { error: message, source: 'local-knowledge-base' },
      { status: 500 }
    );
  }
}
