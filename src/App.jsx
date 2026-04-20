import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import UserDashboard from './pages/UserDashboard'
import StationList from './pages/StationList'
import RoutePlanner from './pages/RoutePlanner'
import ScanQR from './pages/ScanQR'
import OwnerDashboard from './pages/OwnerDashboard'
import ManageStation from './pages/ManageStation'
import Layout from './components/common/Layout'

function PrivateRoute({ children, role }) {
  const { user, userProfile, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-ev-dark flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-ev-green border-t-transparent rounded-full animate-spin" />
  </div>
  if (!user) return <Navigate to="/login" replace />
  if (role && userProfile?.role !== role) return <Navigate to="/" replace />
  return children
}

function RootRedirect() {
  const { user, userProfile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (userProfile?.role === 'owner') return <Navigate to="/owner" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* EV User routes */}
          <Route path="/dashboard" element={
            <PrivateRoute role="user">
              <Layout><UserDashboard /></Layout>
            </PrivateRoute>
          } />
          <Route path="/stations" element={
            <PrivateRoute role="user">
              <Layout><StationList /></Layout>
            </PrivateRoute>
          } />
          <Route path="/route" element={
            <PrivateRoute role="user">
              <Layout><RoutePlanner /></Layout>
            </PrivateRoute>
          } />
          <Route path="/scan/:stationId/:action" element={
            <PrivateRoute>
              <ScanQR />
            </PrivateRoute>
          } />

          {/* Owner routes */}
          <Route path="/owner" element={
            <PrivateRoute role="owner">
              <Layout><OwnerDashboard /></Layout>
            </PrivateRoute>
          } />
          <Route path="/owner/station/new" element={
            <PrivateRoute role="owner">
              <Layout><ManageStation /></Layout>
            </PrivateRoute>
          } />
          <Route path="/owner/station/:id" element={
            <PrivateRoute role="owner">
              <Layout><ManageStation /></Layout>
            </PrivateRoute>
          } />

          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
