/**
 * Maps the app's internal field names to your Notion database property names.
 * Edit these values to match your database's exact property names.
 *
 * How to find property names:
 *   1. Open your Notion database
 *   2. Click on a column header to see its exact name
 *   3. Update the corresponding value below
 */
export const PROPERTY_MAP = {
  /** select or status property — its options become the board columns */
  status: 'Status',
  /** title property — displayed as the card heading */
  title: 'Name',
  /** people property — shown as avatar list on cards */
  assignees: 'Assignee',
  /** date property — shown as due date chip */
  dueDate: 'Due Date',
  /** multi_select property — shown as colored label chips */
  labels: 'Tags',
  /** select property — shown as priority badge (Urgent/High/Medium/Low) */
  priority: 'Priority',
  /** rich_text property — editable in the card modal body */
  description: 'Description',
} as const;

export type PropertyMapKey = keyof typeof PROPERTY_MAP;
