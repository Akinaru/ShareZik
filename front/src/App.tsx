"use client"

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProvider, useUser } from "./hooks/userContext"
import Layout from "./components/Layout"
import { Toaster } from "@/components/ui/sonner"
import { Suspense, lazy, type JSX } from "react"

// Lazy loaded pages
const Login = lazy(() => import("./pages/login"))
const Register = lazy(() => import("./pages/register"))
const Home = lazy(() => import("./pages/home"))
const NewPublication = lazy(() => import("./pages/publication/NewPublication"))
const NotFoundPage = lazy(() => import("./pages/notfound"))
const MyPublication = lazy(() => import("./pages/publication/MyPublication"))
const Genres = lazy(() => import("./pages/genre/genres"))
const Publications = lazy(() => import("./pages/publication/publications"))
const GestionPublication = lazy(() => import("./pages/publication/GestionPublication"))
const GestionGenre = lazy(() => import("./pages/genre/GestionGenre"))

// Routes protégées
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useUser()
  const location = useLocation()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useUser()
  if (isLoading) return null
  if (user) return <Navigate to="/" replace />
  return children
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useUser()
  const location = useLocation()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (user.rank !== "admin") return <Navigate to="/" replace />
  return children
}

function ModRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useUser()
  const location = useLocation()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (user.rank !== "admin" && user.rank !== "mod") return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Suspense>
      <Routes>
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
          path="/admin/publications"
          element={
            <AdminRoute>
              <Layout>
                <GestionPublication />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/genres"
          element={
            <AdminRoute>
              <Layout>
                <GestionGenre />
              </Layout>
            </AdminRoute>
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
        <Route
          path="*"
          element={
            <Layout>
              <NotFoundPage />
            </Layout>
          }
        />
      </Routes>
    </Suspense>
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
