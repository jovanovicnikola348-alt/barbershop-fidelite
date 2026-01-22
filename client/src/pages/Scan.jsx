import React, { useState, useEffect } from 'react'
import { QrCode, Camera, CheckCircle, XCircle, User, Scissors, ArrowLeft, RotateCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

function Scan() {
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState(null)
  const [scanHistory, setScanHistory] = useState([])
  const navigate = useNavigate()

  // Historique simulé
  useEffect(() => {
    setScanHistory([
      { id: 1, client: 'Jean Dupont', time: '10:30', date: '2024-01-15', visits: 4 },
      { id: 2, client: 'Marie Martin', time: '11:15', date: '2024-01-15', visits: 2 },
      { id: 3, client: 'Pierre Bernard', time: '14:45', date: '2024-01-14', visits: 7 }
    ])
  }, [])

  const handleScan = () => {
    setScanning(true)
    
    // Simulation de scan (dans la vraie version, utiliser une librairie QR)
    setTimeout(() => {
      const mockScan = {
        success: true,
        client: {
          name: 'Thomas Petit',
          email: 'thomas@email.com',
          visits: 5,
          nextReward: true
        },
        newVisits: 6,
        reward: '🎉 Félicitations ! Cadeau gagné : Coupe gratuite !'
      }
      
      setScannedData(mockScan)
      setScanning(false)
      
      // Ajouter à l'historique
      setScanHistory(prev => [{
        id: prev.length + 1,
        client: mockScan.client.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0],
        visits: mockScan.newVisits
      }, ...prev])
      
      toast.success('QR Code scanné avec succès !')
    }, 1500)
  }

  const handleReset = () => {
    setScannedData(null)
    setScanning(false)
  }

  const handleBack = () => {
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <QrCode className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Scanner QR Code</h1>
                  <p className="text-white/80 text-sm">Enregistrez les visites clients</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              <RotateCw className="w-5 h-5" />
              <span>Nouveau scan</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Zone de scan */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Scanner un QR Code client</h2>
                <p className="text-white/80">
                  Demandez au client d'ouvrir son QR Code dans son espace personnel
                </p>
              </div>

              {/* Zone caméra/scanner */}
              <div className="relative">
                <div className={`w-full h-96 rounded-2xl border-4 ${scanning ? 'border-green-500 animate-pulse' : 'border-white/30'} flex items-center justify-center bg-black/30`}>
                  {scanning ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-white/90">Scan en cours...</p>
                      <p className="text-white/60 text-sm mt-2">Visez le QR Code du client</p>
                    </div>
                  ) : scannedData ? (
                    <div className="text-center p-8">
                      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                      <p className="text-2xl font-bold text-green-400">Scan réussi !</p>
                      <p className="text-white/80 mt-4">Visite enregistrée avec succès</p>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="inline-flex items-center justify-center w-32 h-32 border-4 border-white/30 rounded-2xl mb-6">
                        <Camera className="w-16 h-16 text-white/50" />
                      </div>
                      <p className="text-white/90">Prêt à scanner</p>
                      <p className="text-white/60 text-sm mt-2">Aucun QR Code détecté</p>
                    </div>
                  )}
                </div>

                {/* Contrôles */}
                <div className="mt-8 flex justify-center space-x-6">
                  {!scannedData && !scanning && (
                    <button
                      onClick={handleScan}
                      className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                    >
                      <QrCode className="w-6 h-6" />
                      <span>Démarrer le scan</span>
                    </button>
                  )}
                  
                  {scannedData && (
                    <button
                      onClick={handleReset}
                      className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                    >
                      <RotateCw className="w-6 h-6" />
                      <span>Scanner un autre client</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Historique récent */}
            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold mb-6">Historique des scans récents</h3>
              <div className="space-y-4">
                {scanHistory.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{scan.client}</p>
                        <p className="text-white/60 text-sm">{scan.date} • {scan.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">{scan.visits} visite{scan.visits > 1 ? 's' : ''}</p>
                        <p className="text-white/60 text-sm">Total</p>
                      </div>
                      <Scissors className="w-5 h-5 text-white/60" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Résultat du scan */}
          <div>
            {scannedData ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-bold mb-6">Résultat du scan</h3>
                
                {/* Info client */}
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{scannedData.client.name}</p>
                      <p className="text-white/60">{scannedData.client.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-white/60 text-sm">Visites totales</p>
                      <p className="text-3xl font-bold mt-1">{scannedData.newVisits}</p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-white/60 text-sm">Prochain cadeau</p>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progression</span>
                          <span>{scannedData.newVisits % 5}/5</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                            style={{ width: `${(scannedData.newVisits % 5) / 5 * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message de récompense */}
                {scannedData.reward && (
                  <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-500/30 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-yellow-300" />
                      </div>
                      <div>
                        <p className="font-bold text-yellow-200">Cadeau débloqué !</p>
                        <p className="text-yellow-100/80 text-sm">{scannedData.reward}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-8 space-y-3">
                  <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-lg transition">
                    Voir le profil complet
                  </button>
                  <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition">
                    Modifier le compte
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-bold mb-6">Instructions</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="font-medium mb-2">1. Demandez au client</p>
                    <p className="text-white/60 text-sm">Le client doit ouvrir son QR Code dans son espace personnel.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="font-medium mb-2">2. Centrez le QR Code</p>
                    <p className="text-white/60 text-sm">Positionnez le QR Code dans le cadre de scan.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="font-medium mb-2">3. Validation automatique</p>
                    <p className="text-white/60 text-sm">La visite est ajoutée automatiquement au compte.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="font-medium mb-2">4. Cadeaux</p>
                    <p className="text-white/60 text-sm">À la 5ème visite, un cadeau est automatiquement attribué.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Scan