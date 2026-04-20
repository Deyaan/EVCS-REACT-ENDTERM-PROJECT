import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useStations } from '../hooks/useStations'
import StationCard from '../components/stations/StationCard'
import { Route, Navigation, AlertCircle, Loader, Clock, Milestone } from 'lucide-react'
import { geocodeAddress, getRoute, isNearRoute, getStatus, getStatusColor } from '../utils/stationUtils'

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function makeStationIcon(status) {
  const color = getStatusColor(status)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
    <circle cx="13" cy="13" r="10" fill="${color}" stroke="#0A0E1A" stroke-width="2.5"/>
    <circle cx="13" cy="13" r="4" fill="#0A0E1A"/>
  </svg>`
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  })
}

function makeEndpointIcon(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.27 21.73 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
  </svg>`
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  })
}

// Helper component to fly map to bounds
function FitBounds({ bounds }) {
  const map = useMap()
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [bounds])
  return null
}

export default function RoutePlanner() {
  const { stations } = useStations()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [routePoints, setRoutePoints] = useState([])
  const [routeInfo, setRouteInfo] = useState(null)
  const [originLatLng, setOriginLatLng] = useState(null)
  const [destLatLng, setDestLatLng] = useState(null)
  const [routeStations, setRouteStations] = useState([])
  const [hasRoute, setHasRoute] = useState(false)

  async function planRoute(e) {
    e.preventDefault()
    if (!origin.trim() || !destination.trim()) return
    setLoading(true)
    setError('')
    setRoutePoints([])
    setRouteStations([])
    setHasRoute(false)

    try {
      // Geocode both addresses via Nominatim
      const [oLatLng, dLatLng] = await Promise.all([
        geocodeAddress(origin),
        geocodeAddress(destination),
      ])
      setOriginLatLng(oLatLng)
      setDestLatLng(dLatLng)

      // Get driving route via OSRM
      const { points, distanceKm, durationMin } = await getRoute(oLatLng, dLatLng)
      setRoutePoints(points)
      setRouteInfo({ distanceKm, durationMin })
      setHasRoute(true)

      // Filter stations near the route
      const nearby = stations.filter(
        s => s.location?.lat && isNearRoute(s.location, points, 10)
      )
      setRouteStations(nearby)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function clearRoute() {
    setRoutePoints([])
    setRouteInfo(null)
    setOriginLatLng(null)
    setDestLatLng(null)
    setRouteStations([])
    setHasRoute(false)
    setOrigin('')
    setDestination('')
    setError('')
  }

  // Bounds for FitBounds helper
  const allBounds = [
    ...(originLatLng ? [[originLatLng.lat, originLatLng.lng]] : []),
    ...(destLatLng ? [[destLatLng.lat, destLatLng.lng]] : []),
    ...routePoints,
  ]

  return (
    <div className="flex flex-col h-screen">
      <div className="p-6 pb-0 shrink-0">
        <h1 className="text-2xl font-semibold text-white mb-1">Route Planner</h1>
        <p className="text-ev-muted text-sm mb-4">Find charging stations along your route — powered by OpenStreetMap, no API key needed</p>

        <form onSubmit={planRoute} className="card p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Navigation size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ev-green" />
              <input
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                placeholder="Starting point (e.g. Bengaluru)"
                className="input pl-9"
                required
              />
            </div>
            <div className="relative flex-1">
              <Navigation size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ev-muted" />
              <input
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Destination (e.g. Mysuru)"
                className="input pl-9"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 whitespace-nowrap">
              {loading ? <Loader size={14} className="animate-spin" /> : <Route size={14} />}
              {loading ? 'Planning…' : 'Plan Route'}
            </button>
            {hasRoute && (
              <button type="button" onClick={clearRoute} className="btn-secondary whitespace-nowrap">
                Clear
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-ev-red text-xs mt-3 bg-ev-red/10 border border-ev-red/20 rounded-xl px-3 py-2">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          {routeInfo && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-ev-border">
              <div className="flex items-center gap-1.5 text-xs text-ev-muted">
                <Milestone size={13} className="text-ev-green" />
                <span className="text-white font-medium">{routeInfo.distanceKm} km</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-ev-muted">
                <Clock size={13} className="text-ev-green" />
                <span className="text-white font-medium">{routeInfo.durationMin} min</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-ev-muted">
                <div className="w-2 h-2 rounded-full bg-ev-green" />
                <span className="text-white font-medium">{routeStations.length}</span> stations along route
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Map + sidebar */}
      <div className="flex flex-1 gap-4 p-6 pt-0 min-h-0 overflow-hidden">
        {/* Map */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-ev-border">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              maxZoom={19}
            />

            {/* All stations (when no route) or route-filtered stations */}
            {(hasRoute ? routeStations : stations).map(station => {
              if (!station.location?.lat) return null
              const status = getStatus(station.currentQueue, station.totalChargers)
              return (
                <Marker
                  key={station.id}
                  position={[station.location.lat, station.location.lng]}
                  icon={makeStationIcon(status)}
                >
                  <Popup className="ev-popup">
                    <div style={{
                      background: '#111827', color: '#fff', padding: '10px 12px',
                      borderRadius: '10px', fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
                      minWidth: '160px'
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{station.name}</div>
                      <div style={{ color: '#6B7280', fontSize: 12 }}>
                        Queue: {station.currentQueue} / {station.totalChargers} chargers
                      </div>
                      <div style={{
                        marginTop: 6, display: 'inline-block', fontSize: 11, padding: '2px 8px',
                        borderRadius: 20, background: getStatusColor(status) + '22',
                        color: getStatusColor(status), fontWeight: 500
                      }}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}

            {/* Route polyline */}
            {routePoints.length > 0 && (
              <Polyline
                positions={routePoints}
                color="#00D97E"
                weight={4}
                opacity={0.85}
              />
            )}

            {/* Origin marker */}
            {originLatLng && (
              <Marker
                position={[originLatLng.lat, originLatLng.lng]}
                icon={makeEndpointIcon('#00D97E')}
              >
                <Popup>
                  <div style={{ background: '#111827', color: '#fff', padding: '8px 10px', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: 12 }}>
                    <strong>Start</strong><br />{origin}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Destination marker */}
            {destLatLng && (
              <Marker
                position={[destLatLng.lat, destLatLng.lng]}
                icon={makeEndpointIcon('#FF4757')}
              >
                <Popup>
                  <div style={{ background: '#111827', color: '#fff', padding: '8px 10px', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: 12 }}>
                    <strong>End</strong><br />{destination}
                  </div>
                </Popup>
              </Marker>
            )}

            {allBounds.length >= 2 && <FitBounds bounds={allBounds} />}
          </MapContainer>
        </div>

        {/* Stations sidebar */}
        {hasRoute && (
          <div className="w-72 shrink-0 overflow-y-auto space-y-3">
            <p className="text-xs font-medium text-ev-muted uppercase tracking-wider sticky top-0 bg-ev-dark pb-1">
              {routeStations.length} station{routeStations.length !== 1 ? 's' : ''} within 10km
            </p>
            {routeStations.length === 0 ? (
              <div className="card p-6 text-center">
                <p className="text-ev-muted text-sm">No stations found near this route.</p>
              </div>
            ) : (
              routeStations.map(s => <StationCard key={s.id} station={s} />)
            )}
          </div>
        )}
      </div>
    </div>
  )
}
