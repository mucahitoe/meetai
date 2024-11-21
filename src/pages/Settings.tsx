import React from 'react';
import { Save } from 'lucide-react';

export function Settings() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary">Manage your application preferences</p>
      </header>

      <div className="card">
        <div className="p-6">
          <form className="space-y-6">
            <div>
              <label
                htmlFor="language"
                className="block text-sm font-medium text-text-secondary"
              >
                Transcription Language
              </label>
              <select
                id="language"
                className="mt-1 block w-full input"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="quality"
                className="block text-sm font-medium text-text-secondary"
              >
                Audio Quality
              </label>
              <select
                id="quality"
                className="mt-1 block w-full input"
              >
                <option>High (128 kbps)</option>
                <option>Medium (64 kbps)</option>
                <option>Low (32 kbps)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Notifications
              </label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    id="email-notifications"
                    type="checkbox"
                    className="h-4 w-4 rounded border-background-secondary text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="email-notifications"
                    className="ml-2 text-sm text-text-secondary"
                  >
                    Email notifications for completed transcriptions
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="task-notifications"
                    type="checkbox"
                    className="h-4 w-4 rounded border-background-secondary text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="task-notifications"
                    className="ml-2 text-sm text-text-secondary"
                  >
                    Notifications for new action items
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}