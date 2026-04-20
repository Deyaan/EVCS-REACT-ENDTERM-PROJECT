import { useEffect, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { X, Download, LogIn, LogOut } from 'lucide-react'

export default function QRModal({ station, onClose }) {
  const origin = window.location.origin

  function downloadQR(type) {
    const canvas = document.getElementById(`qr-${type}`)
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `${station.name.replace(/\s+/g, '-')}-${type}-qr.png`
    a.click()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div
        className="card p-6 w-full max-w-md relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-semibold text-white">{station.name}</h2>
            <p className="text-ev-muted text-xs mt-0.5">Print and place these QR codes at the station</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-ev-dark border border-ev-border flex items-center justify-center hover:border-gray-600 transition-colors ml-3 shrink-0">
            <X size={14} className="text-ev-muted" />
          </button>
        </div>

        {/* QR codes side by side */}
        <div className="grid grid-cols-2 gap-4">
          {['entry', 'exit'].map(type => {
            const url = `${origin}/scan/${station.id}/${type}`
            const isEntry = type === 'entry'
            return (
              <div key={type} className="bg-ev-dark rounded-2xl p-4 flex flex-col items-center border border-ev-border">
                <div className={`flex items-center gap-1.5 mb-3 text-xs font-medium ${isEntry ? 'text-ev-green' : 'text-ev-red'}`}>
                  {isEntry ? <LogIn size={13} /> : <LogOut size={13} />}
                  {isEntry ? 'Entry' : 'Exit'}
                </div>

                {/* White background for QR scannability */}
                <div className="bg-white p-2 rounded-xl mb-3">
                  <QRCodeCanvas
                    id={`qr-${type}`}
                    value={url}
                    size={140}
                    bgColor="#ffffff"
                    fgColor="#0A0E1A"
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <p className="text-ev-muted text-xs text-center break-all mb-3 leading-relaxed"
                  style={{ fontSize: '10px' }}
                >
                  {url}
                </p>

                <button
                  onClick={() => downloadQR(type)}
                  className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5 w-full justify-center"
                >
                  <Download size={12} /> Download
                </button>
              </div>
            )
          })}
        </div>

        {/* Instructions */}
        <div className="mt-4 bg-ev-dark rounded-xl p-3 border border-ev-border">
          <p className="text-xs text-ev-muted leading-relaxed">
            <span className="text-white font-medium">How it works: </span>
            Place the <span className="text-ev-green">Entry QR</span> at the entrance and <span className="text-ev-red">Exit QR</span> at the exit.
            Drivers scan them to update the queue automatically.
          </p>
        </div>
      </div>
    </div>
  )
}
