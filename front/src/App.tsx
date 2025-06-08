import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import Login from "./pages/login"
import Register from "./pages/register"
import Home from "./pages/home"
import { UserProvider, useUser } from "./hooks/userContext"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { useEffect, useRef, type JSX } from "react"
import Layout from "./components/Layout"
import NewPublication from "./pages/publication/NewPublication"
import NotFoundPage from "./pages/notfound"
import MyPublication from "./pages/publication/MyPublication"
import Genres from "./pages/genres"
import Publications from "./pages/publications"

// Route protégée : accès uniquement si connecté
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

  if (isLoading) return null
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

// Route publique : accès uniquement si NON connecté
function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useUser()
  const hasShownToast = useRef(false)

  useEffect(() => {
    if (!isLoading && user && !hasShownToast.current) {
      toast("Déjà connecté", {
        description: "Tu es déjà connecté à ton compte.",
      })
      hasShownToast.current = true
    }
  }, [user, isLoading])

  if (isLoading) return null
  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Layout>
              <NotFoundPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/publications"
        element={
          <ProtectedRoute>
            <Layout>
              <Publications />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/publications/new"
        element={
          <ProtectedRoute>
            <Layout>
              <NewPublication />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/publications/my"
        element={
          <ProtectedRoute>
            <Layout>
              <MyPublication />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/genres"
        element={
          <ProtectedRoute>
            <Layout>
              <Genres />
            </Layout>
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
