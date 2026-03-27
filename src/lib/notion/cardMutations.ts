import { getNotionClient, getDatabaseId } from './client';
import type { CardCreatePayload, CardUpdatePayload } from '../types';
import { PROPERTY_MAP } from '@/config/propertyMap';

export async function createCard(payload: CardCreatePayload) {
  const notion = getNotionClient();
  const DATABASE_ID = getDatabaseId();
  const properties: Record<string, unknown> = {
    [PROPERTY_MAP.title]: {
      title: [{ text: { content: payload.title } }],
    },
  };

  // status can be a 'select' or 'status' type — try both
  properties[PROPERTY_MAP.status] = { select: { name: payload.status } };

  if (payload.description) {
    properties[PROPERTY_MAP.description] = {
      rich_text: [{ text: { content: payload.description } }],
    };
  }

  if (payload.assignees?.length) {
    properties[PROPERTY_MAP.assignees] = {
      people: payload.assignees.map((id) => ({ id })),
    };
  }

  if (payload.dueDate) {
    properties[PROPERTY_MAP.dueDate] = { date: { start: payload.dueDate } };
  }

  if (payload.labels?.length) {
    properties[PROPERTY_MAP.labels] = {
      multi_select: payload.labels.map((name) => ({ name })),
    };
  }

  if (payload.priority) {
    properties[PROPERTY_MAP.priority] = { select: { name: payload.priority } };
  }

  return notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: properties as Parameters<typeof notion.pages.create>[0]['properties'],
  });
}

export async function updateCard(pageId: string, payload: CardUpdatePayload) {
  const notion = getNotionClient();
  const properties: Record<string, unknown> = {};

  if (payload.title !== undefined) {
    properties[PROPERTY_MAP.title] = {
      title: [{ text: { content: payload.title } }],
    };
  }

  if (payload.status !== undefined) {
    properties[PROPERTY_MAP.status] = { select: { name: payload.status } };
  }

  if (payload.description !== undefined) {
    properties[PROPERTY_MAP.description] = {
      rich_text: payload.description
        ? [{ text: { content: payload.description } }]
        : [],
    };
  }

  if (payload.assignees !== undefined) {
    properties[PROPERTY_MAP.assignees] = {
      people: payload.assignees.map((id) => ({ id })),
    };
  }

  if (payload.dueDate !== undefined) {
    properties[PROPERTY_MAP.dueDate] = payload.dueDate
      ? { date: { start: payload.dueDate } }
      : { date: null };
  }

  if (payload.labels !== undefined) {
    properties[PROPERTY_MAP.labels] = {
      multi_select: payload.labels.map((name) => ({ name })),
    };
  }

  if (payload.priority !== undefined) {
    properties[PROPERTY_MAP.priority] = payload.priority
      ? { select: { name: payload.priority } }
      : { select: null };
  }

  return notion.pages.update({
    page_id: pageId,
    properties: properties as Parameters<typeof notion.pages.update>[0]['properties'],
  });
}

export async function deleteCard(pageId: string) {
  const notion = getNotionClient();
  return notion.pages.update({ page_id: pageId, archived: true });
}
