import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import Home from './pages/Home';
import Song from './pages/Song';
import AddSong from './pages/AddSong';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'song/:id', element: <Song /> },
      { path: 'add', element: <AddSong /> }
    ]
  }
], {
  // Handle GitHub Pages base via vite.config.ts base option
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);


