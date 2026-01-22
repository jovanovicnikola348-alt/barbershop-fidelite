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
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (isLogin) {
        // Connexion
        const response = await axios.post('/api/login', { email, password })
        
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
        // Inscription
        await axios.post('/api/register', { email, password, username })
        toast.success('Compte créé ! Connectez-vous')
        setIsLogin(true)
        setEmail('')
        setPassword('')
      }
      
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur')
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
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-white text-purple-700 font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLogin ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          {/* Switch */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white/80 hover:text-white underline transition"
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
              className="w-full text-center text-white/60 hover:text-white text-sm transition"
            >
              Accès administrateur
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login