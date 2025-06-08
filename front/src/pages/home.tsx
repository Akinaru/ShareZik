import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, clearAuthToken } from '@/hooks/api'

interface User {
  id: number
  name: string
  email: string
  avatar: string | null
  created_at: string
}

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api('/me', 'GET')
        setUser(data)
      } catch (err: any) {
        setError(err.message || 'Erreur')
      }
    }

    fetchUser()
  }, [])

  const handleLogout = () => {
    clearAuthToken()
    setUser(null)
    navigate('/')
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Erreur : {error}
        <button
          onClick={handleLogout}
          className="mt-4 block rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Retour à l’accueil
        </button>
      </div>
    )
  }

  if (!user) return <>
  <div className="p-4">Chargement...</div>
  <a href="/login">Login</a>
  </>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Bienvenue {user.name}</h1>
      <p>Email : {user.email}</p>
      <button
        onClick={handleLogout}
        className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        Se déconnecter
      </button>
    </div>
  )
}

export default Home
