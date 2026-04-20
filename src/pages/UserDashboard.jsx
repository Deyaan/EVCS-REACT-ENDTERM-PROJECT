import { useAuth } from '../context/AuthContext'
import { useStations } from '../hooks/useStations'
import { Link } from 'react-router-dom'
import { Zap, MapPin, Route, TrendingUp, ChevronRight } from 'lucide-react'
import StationCard from '../components/stations/StationCard'
import { getStatus } from '../utils/stationUtils'

export default function UserDashboard() {
  const { userProfile } = useAuth()
  const { stations, loading } = useStations()

  const available = stations.filter(s => getStatus(s.currentQueue, s.totalChargers) === 'available').length
  const moderate = stations.filter(s => getStatus(s.currentQueue, s.totalChargers) === 'moderate').length
  const full = stations.filter(s => getStatus(s.currentQueue, s.totalChargers) === 'full').length

  const nearby = stations.slice(0, 3)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Good {getGreeting()}, {userProfile?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-ev-muted text-sm mt-1">Here's the live charging network status.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Stations" value={stations.length} icon={<MapPin size={16} className="text-ev-muted" />} />
        <StatCard label="Available" value={available} icon={<div className="w-2 h-2 rounded-full bg-ev-green animate-pulse" />} color="text-ev-green" />
        <StatCard label="Moderate" value={moderate} icon={<div className="w-2 h-2 rounded-full bg-ev-yellow animate-pulse" />} color="text-ev-yellow" />
        <StatCard label="Full" value={full} icon={<div className="w-2 h-2 rounded-full bg-ev-red animate-pulse" />} color="text-ev-red" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link to="/stations" className="card p-5 flex items-center gap-4 hover:border-ev-green/50 transition-colors group">
          <div className="w-10 h-10 bg-ev-green/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-ev-green/20 transition-colors">
            <MapPin size={18} className="text-ev-green" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-white text-sm">Browse Stations</div>
            <div className="text-xs text-ev-muted mt-0.5">View all charging stations and live queue</div>
          </div>
          <ChevronRight size={16} className="text-ev-muted group-hover:text-ev-green transition-colors" />
        </Link>

        <Link to="/route" className="card p-5 flex items-center gap-4 hover:border-purple-500/50 transition-colors group">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-colors">
            <Route size={18} className="text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-white text-sm">Plan a Route</div>
            <div className="text-xs text-ev-muted mt-0.5">Find charging stops along your journey</div>
          </div>
          <ChevronRight size={16} className="text-ev-muted group-hover:text-purple-400 transition-colors" />
        </Link>
      </div>

      {/* Nearby stations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Stations</h2>
          <Link to="/stations" className="text-xs text-ev-green hover:underline flex items-center gap-1">
            View all <ChevronRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-ev-border rounded mb-3 w-3/4" />
                <div className="h-3 bg-ev-border rounded mb-4 w-1/2" />
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3].map(j => <div key={j} className="h-16 bg-ev-border rounded-xl" />)}
                </div>
              </div>
            ))}
          </div>
        ) : nearby.length === 0 ? (
          <div className="card p-8 text-center">
            <Zap size={32} className="text-ev-muted mx-auto mb-3" />
            <p className="text-ev-muted text-sm">No stations added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nearby.map(s => <StationCard key={s.id} station={s} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color = 'text-white' }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-ev-muted">{label}</span></div>
      <div className={`text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
