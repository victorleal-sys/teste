import { NextRequest, NextResponse } from 'next/server';
import { createCard } from '@/lib/notion/cardMutations';
import type { CardCreatePayload } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: CardCreatePayload = await req.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }
    if (!body.status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 });
    }

    const page = await createCard(body);
    return NextResponse.json({ id: page.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
