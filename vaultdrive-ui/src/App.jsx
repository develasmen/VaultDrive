import { Navigate, Route, Routes } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { getSession } from './lib/session'

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  const [user, setUser] = useState(() => getSession())

  const defaultRoute = useMemo(() => (user ? '/app' : '/login'), [user])

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />
      <Route path="/login" element={<AuthPage mode="login" onAuthenticated={setUser} />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute user={user}>
            <DashboardPage
              user={user}
              onSessionClosed={() => {
                setUser(null)
              }}
            />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </Routes>
  )
}

export default App
