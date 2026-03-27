import { NextResponse } from 'next/server';
import { fetchBoard } from '@/lib/notion/boardFetcher';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const board = await fetchBoard();
    return NextResponse.json(board);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
