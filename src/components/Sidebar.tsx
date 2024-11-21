import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Mic, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Sidebar() {
  const signOut = useAuthStore((state) => state.signOut);
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Mic, label: 'Recordings', path: '/recordings' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-secondary border-r border-background-secondary flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-background-secondary">
        <span className="text-accent font-bold">Meeting</span>
        <span className="text-primary font-bold">AI</span>
      </div>
      
      <nav className="p-4 space-y-2 flex-1">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-secondary-hover hover:text-text-primary'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-background-secondary">
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors w-full text-text-secondary hover:bg-secondary-hover hover:text-accent"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}