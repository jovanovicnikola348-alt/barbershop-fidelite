import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scissors, Mail, Lock, User } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

function Login() {
  const [email, setEmail] = useState('admin@barbershop.com')
  const [password, setPassword] = useState('admin123')
  const [username, setUsername] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // URL du backend en ligne
  const API_URL = 'https://barbershop-api-n73d.onrender.com'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isLogin) {
        // CONNEXION - Version réelle
        console.log('Tentative de connexion avec:', email)
        
        const response = await axios.post(`${API_URL}/api/login`, { 
          email, 
          password 
        }, {
          timeout: 30000 // 30 secondes timeout
        })
        
        console.log('Réponse serveur:', response.data)
        
        if (response.data.success) {
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('user', JSON.stringify(response.data.user))
          localStorage.setItem('qrToken', response.data.qrToken)
          
          toast.success('Connexion réussie !')
          
          // Redirection selon rôle
          if (response.data.user.role === 'admin') {
            navigate('/admin')
          } else {
            navigate('/dashboard')
          }
        } else {
          toast.error(response.data.error || 'Email ou mot de passe incorrect')
        }
        
      } else {
        // INSCRIPTION - Version réelle
        console.log('Tentative d\'inscription:', email)
        
        const response = await axios.post(`${API_URL}/api/register`, { 
          email, 
          password, 
          username 
        }, {
          timeout: 30000
        })
        
        console.log('Réponse inscription:', response.data)
        
        if (response.data.success) {
          toast.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter')
          setIsLogin(true) // Passe en mode connexion
          setEmail('')
          setPassword('')
          setUsername('')
        } else {
          toast.error(response.data.error || "Erreur lors de l'inscription")
        }
      }
      
    } catch (error) {
      console.error('ERREUR DÉTAILLÉE:', error)
      
      if (error.code === 'ECONNABORTED') {
        toast.error('Le serveur met trop de temps à répondre. Réessayez dans 30 secondes.')
      } else if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        toast.error(error.response.data.error || 'Erreur de connexion')
      } else if (error.request) {
        // La requête a été faite mais pas de réponse
        toast.error('Serveur injoignable. Vérifiez votre connexion ou réessayez plus tard.')
      } else {
        toast.error('Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-600 via-pink-600 to-red-500">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <Scissors className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Bienvenue' : 'Créer un compte'}
            </h1>
            <p className="text-white/80">
              {isLogin 
                ? 'Connectez-vous à votre espace fidélité' 
                : 'Rejoignez notre programme de fidélité'
              }
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                    placeholder="Votre nom"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                  placeholder="votre@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-white text-purple-700 hover:bg-white/90'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Connexion en cours...' : 'Création en cours...'}
                </span>
              ) : (
                isLogin ? 'Se connecter' : 'Créer mon compte'
              )}
            </button>
          </form>

          {/* Switch */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
              className="text-white/80 hover:text-white underline transition disabled:opacity-50"
            >
              {isLogin 
                ? 'Pas encore de compte ? Créer un compte' 
                : 'Déjà un compte ? Se connecter'
              }
            </button>
          </div>

          {/* Accès admin rapide */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <button
              onClick={() => {
                setEmail('admin@barbershop.com')
                setPassword('admin123')
                toast.success('Identifiants admin pré-remplis')
              }}
              disabled={loading}
              className="w-full text-center text-white/60 hover:text-white text-sm transition disabled:opacity-50"
            >
              Accès administrateur
            </button>
          </div>

          {/* Debug info */}
          <div className="mt-6 text-center">
            <p className="text-white/40 text-xs">
              Backend: {API_URL}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login