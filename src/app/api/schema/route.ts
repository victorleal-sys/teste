import { NextResponse } from 'next/server';
import { fetchSchema } from '@/lib/notion/schemaFetcher';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const schema = await fetchSchema();
    return NextResponse.json(schema);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
