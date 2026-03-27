import { getNotionClient, getDatabaseId } from './client';
import { fetchSchema } from './schemaFetcher';
import {
  parseTitleProperty,
  parseRichTextProperty,
  parseSelectProperty,
  parseStatusProperty,
  parseMultiSelectProperty,
  parsePeopleProperty,
  parseDateProperty,
} from './propertyParsers';
import type { BoardData, CardData, ColumnData } from '../types';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { PROPERTY_MAP } from '@/config/propertyMap';

async function fetchAllPages(): Promise<PageObjectResponse[]> {
  const notion = getNotionClient();
  const DATABASE_ID = getDatabaseId();
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: DATABASE_ID,
      page_size: 100,
      start_cursor: cursor,
      sorts: [{ property: PROPERTY_MAP.title, direction: 'ascending' }],
    });

    for (const item of response.results) {
      if (item.object === 'page' && 'properties' in item) {
        pages.push(item as PageObjectResponse);
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return pages;
}

function pageToCard(page: PageObjectResponse): CardData {
  const props = page.properties;

  const statusProp = props[PROPERTY_MAP.status];
  let status = '';
  if (statusProp?.type === 'status') {
    status = parseStatusProperty(statusProp);
  } else if (statusProp?.type === 'select') {
    status = parseSelectProperty(statusProp)?.name ?? '';
  }

  return {
    id: page.id,
    title: parseTitleProperty(props[PROPERTY_MAP.title]),
    status,
    description: props[PROPERTY_MAP.description]
      ? parseRichTextProperty(props[PROPERTY_MAP.description])
      : '',
    assignees: props[PROPERTY_MAP.assignees]
      ? parsePeopleProperty(props[PROPERTY_MAP.assignees])
      : [],
    dueDate: props[PROPERTY_MAP.dueDate]
      ? parseDateProperty(props[PROPERTY_MAP.dueDate])
      : null,
    labels: props[PROPERTY_MAP.labels]
      ? parseMultiSelectProperty(props[PROPERTY_MAP.labels])
      : [],
    priority: props[PROPERTY_MAP.priority]
      ? parseSelectProperty(props[PROPERTY_MAP.priority])
      : null,
    notionUrl: page.url,
  };
}

export async function fetchBoard(): Promise<BoardData> {
  const [pages, schema] = await Promise.all([fetchAllPages(), fetchSchema()]);

  const cards = pages.map(pageToCard);

  // Group cards by status, preserving the column order from schema
  const columnMap = new Map<string, ColumnData>();
  for (const opt of schema.statusOptions) {
    columnMap.set(opt.name, {
      id: opt.name,
      title: opt.name,
      color: opt.color,
      cards: [],
    });
  }

  // Cards whose status doesn't match any column go to a fallback column
  const fallbackCards: CardData[] = [];
  for (const card of cards) {
    if (columnMap.has(card.status)) {
      columnMap.get(card.status)!.cards.push(card);
    } else {
      fallbackCards.push(card);
    }
  }

  const columns = Array.from(columnMap.values());

  if (fallbackCards.length > 0) {
    columns.push({
      id: '__uncategorized__',
      title: 'Uncategorized',
      color: 'gray',
      cards: fallbackCards,
    });
  }

  return { columns };
}
