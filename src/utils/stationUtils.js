export function getStatus(currentQueue, totalChargers) {
  if (!totalChargers || currentQueue === 0) return 'available'
  const ratio = currentQueue / totalChargers
  if (ratio >= 1) return 'full'
  if (ratio >= 0.6) return 'moderate'
  return 'available'
}

export function getStatusColor(status) {
  return {
    available: '#00D97E',
    moderate: '#FFB800',
    full: '#FF4757',
  }[status] || '#00D97E'
}

// Haversine formula — distance in km between two lat/lng points (no external lib needed)
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Check if a station is within radiusKm of any point in a route array [[lat,lng],...]
export function isNearRoute(stationLoc, routePoints, radiusKm = 10) {
  return routePoints.some(([rlat, rlng]) =>
    haversineKm(stationLoc.lat, stationLoc.lng, rlat, rlng) <= radiusKm
  )
}

// Geocode an address using Nominatim (OpenStreetMap, free, no key)
export async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  const data = await res.json()
  if (!data.length) throw new Error(`Location not found: "${address}"`)
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name }
}

// Get driving route using OSRM (free, open-source routing, no key)
export async function getRoute(originLatLng, destLatLng) {
  const url = `https://router.project-osrm.org/route/v1/driving/${originLatLng.lng},${originLatLng.lat};${destLatLng.lng},${destLatLng.lat}?overview=full&geometries=geojson`
  const res = await fetch(url)
  const data = await res.json()
  if (data.code !== 'Ok' || !data.routes.length) throw new Error('Route not found between these locations.')
  const route = data.routes[0]
  const points = route.geometry.coordinates.map(([lng, lat]) => [lat, lng])
  const distanceKm = (route.distance / 1000).toFixed(1)
  const durationMin = Math.round(route.duration / 60)
  return { points, distanceKm, durationMin }
}
