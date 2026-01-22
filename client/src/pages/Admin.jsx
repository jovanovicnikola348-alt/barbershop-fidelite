import React, { useState, useEffect } from 'react'
import { Users, Scissors, BarChart3, QrCode, LogOut, Search, Filter, UserCheck, UserX, Eye, Edit, Trash2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

function Admin() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVisits: 0,
    activeUsers: 0,
    rewardsGiven: 0
  })
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Données simulées pour l'instant
    const mockUsers = [
      { id: 1, email: 'client1@email.com', username: 'Jean Dupont', role: 'client', isActive: true, visits: 4, lastVisit: '2024-01-15' },
      { id: 2, email: 'client2@email.com', username: 'Marie Martin', role: 'client', isActive: true, visits: 2, lastVisit: '2024-01-10' },
      { id: 3, email: 'client3@email.com', username: 'Pierre Bernard', role: 'client', isActive: false, visits: 7, lastVisit: '2023-12-20' },
      { id: 4, email: 'client4@email.com', username: 'Sophie Leroy', role: 'client', isActive: true, visits: 1, lastVisit: '2024-01-05' },
      { id: 5, email: 'client5@email.com', username: 'Thomas Petit', role: 'client', isActive: true, visits: 5, lastVisit: '2024-01-18', hasReward: true }
    ]

    setUsers(mockUsers)
    setStats({
      totalUsers: mockUsers.length,
      totalVisits: mockUsers.reduce((sum, user) => sum + user.visits, 0),
      activeUsers: mockUsers.filter(u => u.isActive).length,
      rewardsGiven: mockUsers.filter(u => u.hasReward).length
    })
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    toast.success('Déconnexion admin réussie')
    navigate('/login')
  }

  const handleScanPage = () => {
    navigate('/scan')
  }

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ))
    toast.success('Statut utilisateur mis à jour')
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Admin */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Scissors className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Espace Administrateur</h1>
                <p className="text-white/80 text-sm">Gestion des clients et visites</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleScanPage}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
              >
                <QrCode className="w-5 h-5" />
                <span>Scanner QR Code</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-lg transition"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Clients total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Visites totales</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalVisits}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Clients actifs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
              <UserCheck className="w-10 h-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Cadeaux donnés</p>
                <p className="text-3xl font-bold text-gray-900">{stats.rewardsGiven}</p>
              </div>
              <Scissors className="w-10 h-10 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Gestion des clients</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un client..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                  <Filter className="w-5 h-5" />
                  <span>Filtrer</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visites</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière visite</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadeau</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900">{user.visits}</span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, (user.visits / 5) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.lastVisit}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.hasReward ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          Cadeau disponible
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`p-2 rounded-lg ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={user.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Voir détails">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg" title="Modifier">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Affichage de {filteredUsers.length} client{filteredUsers.length > 1 ? 's' : ''}
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
                Précédent
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
                Suivant
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Guide d'utilisation Admin</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-800 mb-2">1. Scanner un QR Code</p>
              <p className="text-gray-600 text-sm">Utilisez le bouton "Scanner QR Code" pour enregistrer une visite client.</p>
            </div>
            <div>
              <p className="font-medium text-gray-800 mb-2">2. Gérer les clients</p>
              <p className="text-gray-600 text-sm">Activez/désactivez les comptes, modifiez les informations.</p>
            </div>
            <div>
              <p className="font-medium text-gray-800 mb-2">3. Suivi des visites</p>
              <p className="text-gray-600 text-sm">Consultez l'historique et le nombre de visites par client.</p>
            </div>
            <div>
              <p className="font-medium text-gray-800 mb-2">4. Attribution des cadeaux</p>
              <p className="text-gray-600 text-sm">Les cadeaux sont attribués automatiquement après 5 visites.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Admin