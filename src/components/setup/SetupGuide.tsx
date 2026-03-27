import { BookOpen, Key, Database } from 'lucide-react';

export function SetupGuide() {
  return (
    <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
          <BookOpen size={24} className="text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Connect to Notion</h1>
        <p className="mt-1 text-sm text-gray-500">
          A few steps to get your Kanban board running.
        </p>
      </div>

      <ol className="flex flex-col gap-5">
        <li className="flex gap-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            1
          </span>
          <div>
            <div className="flex items-center gap-1.5 font-medium text-gray-800">
              <Key size={14} />
              Create a Notion Integration
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              Go to{' '}
              <span className="font-mono text-xs bg-gray-100 px-1 rounded">
                notion.so/my-integrations
              </span>{' '}
              and create a new integration. Copy the <strong>Internal Integration Token</strong>.
            </p>
          </div>
        </li>

        <li className="flex gap-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            2
          </span>
          <div>
            <div className="flex items-center gap-1.5 font-medium text-gray-800">
              <Database size={14} />
              Share your database with the integration
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              Open your Notion database → click <strong>...</strong> → <strong>Connections</strong> → add your integration.
              Then copy the database ID from the URL.
            </p>
          </div>
        </li>

        <li className="flex gap-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            3
          </span>
          <div>
            <div className="font-medium text-gray-800">Create .env.local</div>
            <p className="mt-0.5 text-sm text-gray-500">
              In the project root, create a file called{' '}
              <span className="font-mono text-xs bg-gray-100 px-1 rounded">.env.local</span>{' '}
              with:
            </p>
            <pre className="mt-2 rounded-lg bg-gray-900 px-4 py-3 text-xs text-green-400">
              {`NOTION_TOKEN=secret_xxxxxxxx\nNOTION_DATABASE_ID=xxxxxxxx`}
            </pre>
          </div>
        </li>

        <li className="flex gap-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            4
          </span>
          <div>
            <div className="font-medium text-gray-800">Match property names</div>
            <p className="mt-0.5 text-sm text-gray-500">
              Edit{' '}
              <span className="font-mono text-xs bg-gray-100 px-1 rounded">
                src/config/propertyMap.ts
              </span>{' '}
              so the values match your database&apos;s column names, then restart the dev server.
            </p>
          </div>
        </li>
      </ol>
    </div>
  );
}
