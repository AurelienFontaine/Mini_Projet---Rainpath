import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App';
import { CaseList } from './pages/CaseList';
import { CaseDetailGraph } from './pages/CaseDetailGraph';
import { CaseCreate } from './pages/CaseCreate';
import './theme.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <CaseList /> },
      { path: 'cases', element: <CaseList /> },
      { path: 'cases/:id', element: <CaseDetailGraph /> },
      { path: 'create', element: <CaseCreate /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);


