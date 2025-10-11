import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { EmailTemplates } from './pages/EmailTemplates'
import Leads from './pages/Leads'
import Campaigns from './pages/Campaigns'
import Settings from './pages/Settings'
import EmailPreview from './pages/EmailPreview'
import ProtectedRoute from './routes/ProtectedRoute'
import Landing from './pages/Landing'
import HudDemo from './pages/HudDemo'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <div style={{padding: '2rem', textAlign: 'center', backgroundColor: '#0f172a', color: 'white', minHeight: '100vh'}}><h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem'}}>IperMoney Lead Generation</h1><p style={{marginBottom: '1rem'}}>Sistema di gestione lead per POS</p><a href="/login" style={{backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', textDecoration: 'none'}}>Accedi</a></div> },
      { path: 'landing', element: <Landing /> },
      { path: 'hud', element: <HudDemo /> },
      { path: 'login', element: <Login /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'email-templates',
        element: (
          <ProtectedRoute>
            <EmailTemplates />
          </ProtectedRoute>
        ),
      },
      {
        path: 'leads',
        element: (
          <ProtectedRoute>
            <Leads />
          </ProtectedRoute>
        ),
      },
      {
        path: 'campaigns',
        element: (
          <ProtectedRoute>
            <Campaigns />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'email-preview/:templateId',
        element: <EmailPreview />,
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
