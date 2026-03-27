export interface NotionUser {
  id: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface Label {
  id: string;
  name: string;
  /** Notion color name: red, orange, yellow, green, blue, purple, pink, gray, brown, default */
  color: string;
}

export interface CardData {
  id: string;
  title: string;
  /** Must match a ColumnData.id */
  status: string;
  description: string;
  assignees: NotionUser[];
  /** ISO date string or null */
  dueDate: string | null;
  labels: Label[];
  priority: Label | null;
  /** Direct URL to open the page in Notion */
  notionUrl: string;
}

export interface ColumnData {
  id: string;
  title: string;
  /** Notion color name for the column header accent */
  color: string;
  cards: CardData[];
}

export interface BoardData {
  columns: ColumnData[];
}

export interface DatabaseSchema {
  statusOptions: Label[];
  priorityOptions: Label[];
  labelOptions: Label[];
  workspaceUsers: NotionUser[];
}

/** Partial update payload sent from client → PATCH /api/cards/[id] */
export interface CardUpdatePayload {
  title?: string;
  status?: string;
  description?: string;
  assignees?: string[]; // user IDs
  dueDate?: string | null;
  labels?: string[]; // option names
  priority?: string | null; // option name
}

/** Body sent to POST /api/cards */
export interface CardCreatePayload {
  title: string;
  status: string;
  description?: string;
  assignees?: string[];
  dueDate?: string | null;
  labels?: string[];
  priority?: string | null;
}
