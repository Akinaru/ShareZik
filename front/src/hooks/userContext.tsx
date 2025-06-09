import { createContext, useContext, useState, useEffect } from "react"
import { api } from "@/hooks/api"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/Models/User"

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const isAdmin = (user: User | null): boolean => {
  return user?.rank === "admin"
}

export const isMod = (user: User | null): boolean => {
  return user?.rank === "mod"
}

export const isValidated = (user: User | null): boolean => {
  return user?.is_validated === true;
}


export const getRankBadge = (rank: string) => {
    switch (rank) {
      case "admin":
        return (
          <Badge variant="destructive" className="flex items-center gap-1 px-1.5 py-0.5 text-xs">
            A
          </Badge>
        )
      case "mod":
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 bg-blue-500 text-white dark:bg-blue-600 px-1.5 py-0.5 text-xs"
          >
            M
          </Badge>
        )
      case "guest":
      default:
        return null
    }
}

export const getUserColor = (rank: string) => {
    switch (rank) {
      case "admin":
        return "text-red-500 dark:text-red-400"
      case "mod":
        return "text-blue-500 dark:text-blue-400"
      default:
        return "text-muted-foreground"
    }
}

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken")
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const data = await api("/me", "GET")
        setUser(data)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const logout = () => {
    setUser(null)
    localStorage.removeItem("authToken")
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error("useUser must be used within a UserProvider")
  return context
}
