import { createContext, useContext, useState, useEffect } from "react"
import { api } from "@/hooks/api"

interface User {
  id: number
  name: string
  email: string
  avatar: string | null
  created_at: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api('/me', 'GET')
        setUser(data)
      } catch {
        setUser(null)
      }
    }

    fetchUser()
  }, [])

  const logout = () => {
    setUser(null)
    localStorage.removeItem("authToken")
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error("useUser must be used within a UserProvider")
  return context
}
