import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, runTransaction, serverTimestamp, collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { Html5Qrcode } from 'html5-qrcode'
import { CheckCircle, XCircle, QrCode, ArrowLeft, Zap } from 'lucide-react'

export default function ScanQR() {
  const { stationId, action } = useParams()
  const navigate = useNavigate()
  const scannerRef = useRef(null)
  const [status, setStatus] = useState('scanning') // scanning | success | error | processing
  const [message, setMessage] = useState('')
  const [stationName, setStationName] = useState('')

  useEffect(() => {
    // If stationId and action come from URL (QR code direct link), process immediately
    if (stationId && action) {
      processQueueUpdate(stationId, action)
      return
    }
    // Otherwise start camera scanner
    startScanner()
    return () => stopScanner()
  }, [])

  async function startScanner() {
    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await stopScanner()
          // Parse URL like /scan/stationId/entry
          const match = decodedText.match(/\/scan\/([^/]+)\/(entry|exit)/)
          if (match) {
            await processQueueUpdate(match[1], match[2])
          } else {
            setStatus('error')
            setMessage('Invalid QR code. Please scan a valid EVCS QR.')
          }
        },
        () => {}
      )
    } catch {
      setStatus('error')
      setMessage('Camera access denied. Please allow camera permission.')
    }
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch {}
      scannerRef.current = null
    }
  }

  async function processQueueUpdate(sid, act) {
    setStatus('processing')
    try {
      const stationRef = doc(db, 'stations', sid)
      let name = ''
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(stationRef)
        if (!snap.exists()) throw new Error('Station not found')
        const data = snap.data()
        name = data.name
        setStationName(data.name)
        let newQueue = data.currentQueue || 0
        if (act === 'entry') {
          newQueue = Math.min(newQueue + 1, data.totalChargers * 2)
        } else {
          newQueue = Math.max(0, newQueue - 1)
        }
        transaction.update(stationRef, { currentQueue: newQueue })
      })

      // Log to queueLogs
      await addDoc(collection(db, 'queueLogs'), {
        stationId: sid,
        action: act,
        timestamp: serverTimestamp(),
      })

      setStationName(name)
      setStatus('success')
      setMessage(act === 'entry' ? 'Entry recorded. Queue updated!' : 'Exit recorded. Queue updated!')

      // Auto-go-back after 3s
      setTimeout(() => navigate(-1), 3000)
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Failed to update queue. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-ev-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-ev-card border border-ev-border flex items-center justify-center hover:border-gray-600 transition-colors">
            <ArrowLeft size={15} className="text-ev-muted" />
          </button>
          <div>
            <h1 className="text-white font-semibold">{action === 'entry' ? 'Station Entry' : 'Station Exit'}</h1>
            <p className="text-ev-muted text-xs">QR Queue Update</p>
          </div>
        </div>

        {status === 'scanning' && (
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-ev-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode size={22} className="text-ev-green" />
            </div>
            <h2 className="font-semibold text-white mb-1">Scan QR Code</h2>
            <p className="text-ev-muted text-xs mb-5">Point camera at the station QR code</p>
            <div id="qr-reader" className="rounded-xl overflow-hidden" />
          </div>
        )}

        {status === 'processing' && (
          <div className="card p-8 text-center">
            <div className="w-12 h-12 border-2 border-ev-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-medium">Updating queue…</p>
            {stationName && <p className="text-ev-muted text-xs mt-1">{stationName}</p>}
          </div>
        )}

        {status === 'success' && (
          <div className="card p-8 text-center">
            <div className="w-14 h-14 bg-ev-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={30} className="text-ev-green" />
            </div>
            <h2 className="font-semibold text-white text-lg mb-1">Done!</h2>
            {stationName && <p className="text-sm text-ev-muted mb-2">{stationName}</p>}
            <p className="text-ev-green text-sm">{message}</p>
            <p className="text-ev-muted text-xs mt-4">Redirecting in 3 seconds…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="card p-8 text-center">
            <div className="w-14 h-14 bg-ev-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={30} className="text-ev-red" />
            </div>
            <h2 className="font-semibold text-white text-lg mb-2">Error</h2>
            <p className="text-ev-muted text-sm mb-5">{message}</p>
            <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
          </div>
        )}
      </div>
    </div>
  )
}
