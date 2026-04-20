import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStations } from '../hooks/useStations'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import StationCard from '../components/stations/StationCard'
import QRModal from '../components/stations/QRModal'
import { PlusCircle, QrCode, Edit2, Trash2, Activity, Zap, Users } from 'lucide-react'
import { getStatus } from '../utils/stationUtils'

export default function OwnerDashboard() {
  const { userProfile } = useAuth()
  const { stations, loading } = useStations(userProfile?.id)
  const navigate = useNavigate()
  const [qrStation, setQrStation] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const totalChargers = stations.reduce((a, s) => a + (s.totalChargers || 0), 0)
  const totalQueue = stations.reduce((a, s) => a + (s.currentQueue || 0), 0)
  const available = stations.filter(s => getStatus(s.currentQueue, s.totalChargers) === 'available').length

  async function handleDelete(station) {
    if (!confirm(`Delete "${station.name}"? This cannot be undone.`)) return
    setDeleting(station.id)
    try {
      await deleteDoc(doc(db, 'stations', station.id))
    } catch (err) {
      alert('Failed to delete station: ' + err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Owner Dashboard</h1>
          <p className="text-ev-muted text-sm mt-1">Manage your charging stations</p>
        </div>
        <Link to="/owner/station/new" className="btn-primary flex items-center gap-2">
          <PlusCircle size={15} />
          Add Station
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2"><Activity size={14} className="text-ev-muted" /><span className="text-xs text-ev-muted">My Stations</span></div>
          <div className="text-2xl font-semibold text-white">{stations.length}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2"><Zap size={14} className="text-ev-muted" /><span className="text-xs text-ev-muted">Total Chargers</span></div>
          <div className="text-2xl font-semibold text-white">{totalChargers}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2"><Users size={14} className="text-ev-yellow" /><span className="text-xs text-ev-muted">In Queue</span></div>
          <div className="text-2xl font-semibold text-ev-yellow">{totalQueue}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 rounded-full bg-ev-green" /><span className="text-xs text-ev-muted">Available</span></div>
          <div className="text-2xl font-semibold text-ev-green">{available}</div>
        </div>
      </div>

      {/* Stations */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="card p-5 animate-pulse h-48" />)}
        </div>
      ) : stations.length === 0 ? (
        <div className="card p-12 text-center">
          <Zap size={36} className="text-ev-muted mx-auto mb-3" />
          <p className="text-white font-medium mb-1">No stations yet</p>
          <p className="text-ev-muted text-sm mb-5">Add your first charging station to get started</p>
          <Link to="/owner/station/new" className="btn-primary inline-flex items-center gap-2">
            <PlusCircle size={15} /> Add Station
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stations.map(s => (
            <StationCard
              key={s.id}
              station={s}
              actions={
                <>
                  <button onClick={() => setQrStation(s)} className="btn-secondary flex items-center gap-1.5 flex-1 justify-center">
                    <QrCode size={13} /> QR Codes
                  </button>
                  <button onClick={() => navigate(`/owner/station/${s.id}`)} className="btn-secondary flex items-center gap-1.5 flex-1 justify-center">
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    disabled={deleting === s.id}
                    className="btn-danger flex items-center gap-1.5 px-3"
                  >
                    {deleting === s.id
                      ? <div className="w-3.5 h-3.5 border-2 border-ev-red border-t-transparent rounded-full animate-spin" />
                      : <Trash2 size={13} />}
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}

      {/* QR Modal */}
      {qrStation && <QRModal station={qrStation} onClose={() => setQrStation(null)} />}
    </div>
  )
}
