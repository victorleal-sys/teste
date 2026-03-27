import { BoardView } from '@/components/board/BoardView';
import { SetupGuide } from '@/components/setup/SetupGuide';

export default function Home() {
  const isConfigured =
    Boolean(process.env.NOTION_TOKEN) &&
    Boolean(process.env.NOTION_DATABASE_ID);

  if (!isConfigured) {
    return (
      <div className="flex flex-1 overflow-y-auto">
        <SetupGuide />
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <BoardView />
    </div>
  );
}
