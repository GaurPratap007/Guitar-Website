import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export default function App(): JSX.Element {
  const { pathname } = useLocation();
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg text-brand-700">
            Chord Tabs
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4 text-sm">
            <Link to="/" className={pathname === '/' ? 'text-brand-600' : 'text-gray-600 hover:text-gray-900'}>Home</Link>
            <Link to="/add" className={pathname === '/add' ? 'text-brand-600' : 'text-gray-600 hover:text-gray-900'}>Add Song</Link>
            <a href="https://github.com/" className="text-gray-600 hover:text-gray-900" aria-label="GitHub repository">GitHub</a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 py-8 text-center text-xs text-gray-500">
        MIT Licensed. Built with React, Vite, and Tailwind.
      </footer>
    </div>
  );
}


