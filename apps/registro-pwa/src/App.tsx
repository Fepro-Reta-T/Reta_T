import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return (
    <main className="screen">
      <h1>Reta_T</h1>
      <p className="subtitle">Registro de partido</p>

      <div className={`status ${isOnline ? 'status-online' : 'status-offline'}`}>
        {isOnline ? 'Conectado' : 'Sin conexión — los eventos se guardan localmente'}
      </div>

      <p className="placeholder">
        Todavía no hay un partido activo para registrar.
      </p>
    </main>
  )
}

export default App
