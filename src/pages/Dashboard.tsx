import React from 'react';
import { Clock, Calendar, ListTodo } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary">Overview of your meeting insights</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: Clock, label: 'Total Hours', value: '24h' },
          { icon: Calendar, label: 'Meetings', value: '12' },
          { icon: ListTodo, label: 'Action Items', value: '36' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">{label}</p>
                <p className="text-2xl font-semibold text-text-primary">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Recent Meetings
          </h2>
          <div className="space-y-4">
            {[
              'Product Strategy Review',
              'Team Weekly Sync',
              'Client Presentation',
            ].map((meeting) => (
              <div
                key={meeting}
                className="p-4 rounded-lg bg-secondary-hover hover:bg-background-secondary transition-colors cursor-pointer"
              >
                <h3 className="font-medium text-text-primary">{meeting}</h3>
                <p className="text-sm text-text-secondary">2 hours ago</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Action Items
          </h2>
          <div className="space-y-4">
            {[
              'Update project timeline',
              'Review design mockups',
              'Schedule follow-up meeting',
            ].map((task) => (
              <div
                key={task}
                className="flex items-center space-x-3 p-4 rounded-lg bg-secondary-hover"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary rounded border-background-secondary focus:ring-primary"
                />
                <span className="text-text-primary">{task}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}