import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import Login from "./pages/login"
import Register from "./pages/register"
import Home from "./pages/home"
import { UserProvider, useUser } from "./hooks/userContext"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { useEffect, useRef, type JSX } from "react"

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useUser()
  const location = useLocation()
  const hasShownToast = useRef(false)

  useEffect(() => {
    if (!isLoading && !user && !hasShownToast.current) {
      toast("Connexion requise", {
        description: "Merci de vous connecter pour accéder à cette page.",
      })
      hasShownToast.current = true
    }
  }, [user, isLoading])

  if (isLoading) return null // ou un loader si tu veux

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <UserProvider>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
