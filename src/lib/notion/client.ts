import { Client } from '@notionhq/client';

let _notion: Client | null = null;

export function getNotionClient(): Client {
  if (!process.env.NOTION_TOKEN) {
    throw new Error(
      'Missing NOTION_TOKEN. Create .env.local with NOTION_TOKEN=secret_...'
    );
  }
  if (!_notion) {
    _notion = new Client({ auth: process.env.NOTION_TOKEN });
  }
  return _notion;
}

export function getDatabaseId(): string {
  if (!process.env.NOTION_DATABASE_ID) {
    throw new Error(
      'Missing NOTION_DATABASE_ID. Create .env.local with NOTION_DATABASE_ID=...'
    );
  }
  return process.env.NOTION_DATABASE_ID;
}
