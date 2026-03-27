import { getNotionClient, getDatabaseId } from './client';
import type { DatabaseSchema, Label, NotionUser } from '../types';
import type { DataSourceObjectResponse } from '@notionhq/client/build/src/api-endpoints/data-sources';
import { PROPERTY_MAP } from '@/config/propertyMap';

function extractSelectOptions(
  db: DataSourceObjectResponse,
  propertyName: string
): Label[] {
  const prop = db.properties[propertyName];
  if (!prop) return [];

  if (prop.type === 'select') {
    return prop.select.options.map((o) => ({
      id: o.id,
      name: o.name,
      color: o.color ?? 'default',
    }));
  }

  if (prop.type === 'status') {
    return prop.status.options.map((o) => ({
      id: o.id,
      name: o.name,
      color: o.color ?? 'default',
    }));
  }

  return [];
}

export async function fetchSchema(): Promise<DatabaseSchema> {
  const notion = getNotionClient();
  const DATABASE_ID = getDatabaseId();
  const [dbResponse, usersResponse] = await Promise.all([
    notion.dataSources.retrieve({ data_source_id: DATABASE_ID }),
    notion.users.list({ page_size: 100 }),
  ]);

  // Only full DataSourceObjectResponse has the properties map
  if (dbResponse.object !== 'data_source' || !('title' in dbResponse)) {
    throw new Error('Unable to retrieve full data source schema.');
  }
  const db = dbResponse as DataSourceObjectResponse;

  const workspaceUsers: NotionUser[] = usersResponse.results
    .filter((u) => u.type === 'person')
    .map((u) => ({
      id: u.id,
      name: u.name ?? null,
      avatarUrl: 'avatar_url' in u ? (u.avatar_url ?? null) : null,
    }));

  return {
    statusOptions: extractSelectOptions(db, PROPERTY_MAP.status),
    priorityOptions: extractSelectOptions(db, PROPERTY_MAP.priority),
    labelOptions: extractSelectOptions(db, PROPERTY_MAP.labels),
    workspaceUsers,
  };
}
