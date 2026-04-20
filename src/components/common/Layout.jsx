import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Zap, LayoutDashboard, MapPin, Route, LogOut,
  QrCode, PlusCircle, Activity
} from 'lucide-react'

export default function Layout({ children }) {
  const { userProfile, logout } = useAuth()
  const navigate = useNavigate()
  const isOwner = userProfile?.role === 'owner'

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const userNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/stations', icon: MapPin, label: 'Stations' },
    { to: '/route', icon: Route, label: 'Route Planner' },
  ]

  const ownerNav = [
    { to: '/owner', icon: Activity, label: 'Dashboard' },
    { to: '/owner/station/new', icon: PlusCircle, label: 'Add Station' },
  ]

  const navItems = isOwner ? ownerNav : userNav

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-ev-card border-r border-ev-border flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-ev-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-ev-green rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-ev-dark" fill="currentColor" />
            </div>
            <span className="font-semibold text-white tracking-tight">EVCS</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/owner' || to === '/dashboard'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-3 pb-4 border-t border-ev-border pt-4">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-200 truncate">{userProfile?.name}</p>
            <p className="text-xs text-ev-muted truncate">{userProfile?.email}</p>
            <span className={`mt-1.5 inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${
              isOwner ? 'bg-purple-500/10 text-purple-400' : 'bg-ev-green/10 text-ev-green'
            }`}>
              {isOwner ? 'Station Owner' : 'EV Driver'}
            </span>
          </div>
          <button onClick={handleLogout} className="nav-link w-full text-left">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-ev-dark">
        <div className="page-enter">
          {children}
        </div>
      </main>
    </div>
  )
}
