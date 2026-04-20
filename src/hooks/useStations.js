import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

// Real-time stations listener (all stations or filtered by owner)
export function useStations(ownerId = null) {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let q
    if (ownerId) {
      q = query(collection(db, 'stations'), where('ownerId', '==', ownerId))
    } else {
      q = query(collection(db, 'stations'), orderBy('name'))
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        setStations(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error(err)
        setError(err.message)
        setLoading(false)
      }
    )
    return unsub
  }, [ownerId])

  return { stations, loading, error }
}
