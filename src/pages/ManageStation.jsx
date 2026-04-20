import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { MapPin, Save, ArrowLeft, Loader, Search } from 'lucide-react'
import { geocodeAddress } from '../utils/stationUtils'

// Fix Leaflet default icon with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const stationIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.27 21.73 0 14 0z" fill="#00D97E"/>
    <circle cx="14" cy="14" r="6" fill="#0A0E1A"/>
  </svg>`,
  className: '',
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -36],
})

// Component that handles map clicks to place marker
function ClickHandler({ onLocationPick }) {
  useMapEvents({
    click(e) {
      onLocationPick(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6))
    },
  })
  return null
}

export default function ManageStation() {
  const { id } = useParams()
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    name: '',
    address: '',
    totalChargers: 2,
    lat: '',
    lng: '',
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')
  const [searchAddr, setSearchAddr] = useState('')
  const [searching, setSearching] = useState(false)
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]) // Bengaluru default

  useEffect(() => {
    if (!isEdit) return
    getDoc(doc(db, 'stations', id)).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        setForm({
          name: d.name || '',
          address: d.address || '',
          totalChargers: d.totalChargers || 2,
          lat: d.location?.lat || '',
          lng: d.location?.lng || '',
        })
        if (d.location?.lat) setMapCenter([d.location.lat, d.location.lng])
      }
      setFetching(false)
    })
  }, [id])

  function set(field) {
    return (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function handleLocationPick(lat, lng) {
    setForm(f => ({ ...f, lat, lng }))
  }

  async function searchOnMap(e) {
    e.preventDefault()
    if (!searchAddr.trim()) return
    setSearching(true)
    try {
      const result = await geocodeAddress(searchAddr)
      setForm(f => ({ ...f, lat: result.lat.toFixed(6), lng: result.lng.toFixed(6), address: f.address || searchAddr }))
      setMapCenter([result.lat, result.lng])
    } catch (err) {
      setError('Address not found. Try a different search.')
    } finally {
      setSearching(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.lat || !form.lng) return setError('Please click on the map or search an address to set the location.')
    setError('')
    setLoading(true)
    try {
      const data = {
        name: form.name.trim(),
        address: form.address.trim(),
        totalChargers: Number(form.totalChargers),
        location: { lat: Number(form.lat), lng: Number(form.lng) },
        ownerId: userProfile.id,
        updatedAt: serverTimestamp(),
      }
      if (isEdit) {
        await setDoc(doc(db, 'stations', id), data, { merge: true })
      } else {
        await addDoc(collection(db, 'stations'), {
          ...data,
          currentQueue: 0,
          createdAt: serverTimestamp(),
        })
      }
      navigate('/owner')
    } catch (err) {
      setError('Failed to save: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-ev-green border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const markerPos = form.lat && form.lng ? [Number(form.lat), Number(form.lng)] : null

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/owner')} className="w-8 h-8 rounded-xl bg-ev-card border border-ev-border flex items-center justify-center hover:border-gray-600 transition-colors">
          <ArrowLeft size={15} className="text-ev-muted" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-white">{isEdit ? 'Edit Station' : 'Add Station'}</h1>
          <p className="text-ev-muted text-sm">{isEdit ? 'Update station details' : 'Register a new charging station'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-5">
          <div className="card p-5 space-y-4">
            <h2 className="font-medium text-white text-sm">Station Details</h2>

            <div>
              <label className="label">Station Name</label>
              <input value={form.name} onChange={set('name')} className="input" placeholder="e.g. MG Road EV Hub" required />
            </div>

            <div>
              <label className="label">Address (optional display label)</label>
              <input value={form.address} onChange={set('address')} className="input" placeholder="e.g. 42 MG Road, Bengaluru" />
            </div>

            <div>
              <label className="label">Number of Chargers</label>
              <div className="flex items-center gap-3">
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, totalChargers: Math.max(1, f.totalChargers - 1) }))}
                  className="w-9 h-9 rounded-xl bg-ev-dark border border-ev-border text-white hover:border-gray-600 flex items-center justify-center text-lg">−</button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-semibold text-white">{form.totalChargers}</span>
                  <div className="text-xs text-ev-muted mt-0.5">chargers</div>
                </div>
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, totalChargers: Math.min(50, f.totalChargers + 1) }))}
                  className="w-9 h-9 rounded-xl bg-ev-dark border border-ev-border text-white hover:border-gray-600 flex items-center justify-center text-lg">+</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Latitude</label>
                <input value={form.lat} onChange={set('lat')} className="input font-mono text-xs" placeholder="12.9716" />
              </div>
              <div>
                <label className="label">Longitude</label>
                <input value={form.lng} onChange={set('lng')} className="input font-mono text-xs" placeholder="77.5946" />
              </div>
            </div>

            {form.lat && form.lng ? (
              <div className="flex items-center gap-1.5 text-xs text-ev-green">
                <MapPin size={12} /> Location set at ({Number(form.lat).toFixed(4)}, {Number(form.lng).toFixed(4)})
              </div>
            ) : (
              <p className="text-xs text-ev-muted flex items-center gap-1.5">
                <MapPin size={11} /> Search an address or click on the map to set location
              </p>
            )}
          </div>

          {error && (
            <div className="text-ev-red text-xs bg-ev-red/10 border border-ev-red/20 rounded-xl px-3 py-2.5">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Loader size={15} className="animate-spin" /> : <Save size={15} />}
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Station'}
          </button>
        </div>

        {/* Right: Map */}
        <div className="space-y-3">
          {/* Address search */}
          <form onSubmit={searchOnMap} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ev-muted" />
              <input
                value={searchAddr}
                onChange={e => setSearchAddr(e.target.value)}
                placeholder="Search address on map…"
                className="input pl-8 text-xs"
              />
            </div>
            <button type="submit" disabled={searching} className="btn-secondary flex items-center gap-1.5 text-xs px-3 whitespace-nowrap">
              {searching ? <Loader size={12} className="animate-spin" /> : <Search size={12} />}
              Find
            </button>
          </form>

          <div className="card overflow-hidden" style={{ height: '400px' }}>
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
              key={mapCenter.join(',')}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <ClickHandler onLocationPick={handleLocationPick} />
              {markerPos && <Marker position={markerPos} icon={stationIcon} />}
            </MapContainer>
          </div>
          <p className="text-xs text-ev-muted text-center">Click anywhere on the map to drop the station pin</p>
        </div>
      </form>
    </div>
  )
}
