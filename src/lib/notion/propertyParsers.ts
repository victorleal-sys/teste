import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type { Label, NotionUser } from '../types';

type Properties = PageObjectResponse['properties'];
type Property = Properties[string];

export function parseTitleProperty(prop: Property): string {
  if (prop.type !== 'title') return '';
  return prop.title.map((t) => t.plain_text).join('');
}

export function parseRichTextProperty(prop: Property): string {
  if (prop.type !== 'rich_text') return '';
  return prop.rich_text.map((t) => t.plain_text).join('');
}

export function parseSelectProperty(prop: Property): Label | null {
  if (prop.type !== 'select' || !prop.select) return null;
  return {
    id: prop.select.id ?? prop.select.name,
    name: prop.select.name,
    color: prop.select.color ?? 'default',
  };
}

export function parseStatusProperty(prop: Property): string {
  if (prop.type !== 'status' || !prop.status) return '';
  return prop.status.name;
}

export function parseMultiSelectProperty(prop: Property): Label[] {
  if (prop.type !== 'multi_select') return [];
  return prop.multi_select.map((opt) => ({
    id: opt.id ?? opt.name,
    name: opt.name,
    color: opt.color ?? 'default',
  }));
}

export function parsePeopleProperty(prop: Property): NotionUser[] {
  if (prop.type !== 'people') return [];
  return prop.people
    .filter((p) => p.object === 'user')
    .map((p) => ({
      id: p.id,
      name: 'name' in p ? (p.name ?? null) : null,
      avatarUrl: 'avatar_url' in p ? (p.avatar_url ?? null) : null,
    }));
}

export function parseDateProperty(prop: Property): string | null {
  if (prop.type !== 'date' || !prop.date) return null;
  return prop.date.start;
}
