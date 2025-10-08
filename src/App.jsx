import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { AuthProvider } from './contexts/AuthContext'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import HomePage from './pages/HomePage'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import Debug from './pages/Debug'
import ProtectedRoute from './components/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <FavoritesProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<HomePage />} />
                </Route>

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />

                {/* Debug Route */}
                <Route path="/debug" element={<Debug />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                </Route>
              </Routes>
            </BrowserRouter>

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#ffffff',
                  color: '#111827',
                  fontWeight: '500',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                  style: {
                    background: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #6ee7b7',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                  style: {
                    background: '#fef2f2',
                    color: '#991b1b',
                    border: '1px solid #fca5a5',
                  },
                },
              }}
            />
          </AuthProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
