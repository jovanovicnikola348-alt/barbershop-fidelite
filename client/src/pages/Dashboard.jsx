import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Scissors, Gift, History, LogOut, Trophy, Calendar, User, Sparkles, ChevronRight, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

function Dashboard() {
  const [user, setUser] = useState(null)
  const [visits, setVisits] = useState([])
  const [totalVisits, setTotalVisits] = useState(0)
  const [qrToken, setQrToken] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/dashboard')
      
      if (response.data.success) {
        setUser(response.data.user)
        setVisits(response.data.visits || [])
        setTotalVisits(response.data.totalVisits || 0)
        
        const storedQrToken = localStorage.getItem('qrToken')
        if (storedQrToken) {
          setQrToken(storedQrToken)
        }
      } else {
        toast.error('Erreur de chargement des données')
      }
    } catch (error) {
      console.error('Erreur dashboard:', error)
      if (error.response?.status === 401) {
        toast.error('Session expirée, veuillez vous reconnecter')
        navigate('/login')
      } else {
        toast.error('Impossible de charger les données')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    toast.success('Déconnexion réussie')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre espace...</p>
        </div>
      </div>
    )
  }

  const progress = {
    current: totalVisits % 5,
    total: 5,
    nextReward: 'Coupe gratuite',
    percentage: Math.min(100, (totalVisits % 5) / 5 * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Scissors className="w-6 h-6 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Mon Espace Fidélité</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDashboardData}
                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                title="Rafraîchir"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="text-right">
                <p className="font-medium text-gray-900">{user?.email || 'Chargement...'}</p>
                <p className="text-sm text-gray-500">Client</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Carte gauche - Progression */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progression */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Votre Progression</h2>
                  <p className="text-gray-600">5 visites = 1 cadeau offert</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{progress.current}/{progress.total} visites</span>
                  <span>{Math.round(progress.percentage)}%</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <Sparkles className="w-6 h-6 text-yellow-500 inline-block mb-2" />
                <p className="font-semibold text-gray-900">
                  Prochain cadeau : <span className="text-purple-600">{progress.nextReward}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {progress.total - progress.current} visite(s) restante(s)
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-gray-900">{totalVisits}</p>
                  <p className="text-sm text-gray-600">Visites totales</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-gray-900">{Math.floor(totalVisits / 5)}</p>
                  <p className="text-sm text-gray-600">Cadeaux gagnés</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-gray-900">{5 - progress.current}</p>
                  <p className="text-sm text-gray-600">Restantes</p>
                </div>
              </div>
            </div>

            {/* Historique */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <History className="w-6 h-6 text-gray-700" />
                  <h2 className="text-xl font-bold text-gray-900">Historique des visites</h2>
                </div>
                <span className="text-sm text-gray-500">{visits.length} visite(s)</span>
              </div>

              {visits.length > 0 ? (
                <div className="space-y-4">
                  {visits.map((visit) => (
                    <div key={visit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Visite #{visit.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(visit.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune visite enregistrée</p>
                  <p className="text-sm text-gray-400 mt-2">Présentez votre QR Code lors de votre prochaine visite</p>
                </div>
              )}
            </div>
          </div>

          {/* Carte droite - QR Code */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Votre QR Code</h2>
              
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-gray-50 rounded-2xl">
                  {qrToken ? (
                    <QRCodeSVG 
                      value={qrToken}
                      size={200}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="H"
                      className="qr-pulse"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Chargement QR Code...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 text-center text-sm">
                  Présentez ce QR Code lors de votre visite pour accumuler des points.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 font-medium">
                    💡 <strong>Comment ça marche :</strong>
                  </p>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>1. Montrez votre QR Code au barbier</li>
                    <li>2. Il le scanne avec l'app admin</li>
                    <li>3. Une visite est ajoutée à votre compte</li>
                    <li>4. Après 5 visites : cadeau offert !</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cadeaux */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Vos cadeaux</h2>
                <Gift className="w-6 h-6 text-purple-600" />
              </div>

              <div className="space-y-4">
                {totalVisits >= 5 ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Gift className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-800">Coupe gratuite</p>
                        <p className="text-sm text-green-600">Disponible maintenant !</p>
                      </div>
                    </div>
                    <button className="w-full mt-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition">
                      Utiliser ce cadeau
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun cadeau disponible</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {5 - progress.current} visite(s) avant votre prochain cadeau
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 text-center">
        <p className="text-gray-500 text-sm">
          Barbershop Fidélité • 5 visites = 1 cadeau • © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}

export default Dashboard