import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import Login from "./pages/login"
import Register from "./pages/register"
import Home from "./pages/home"
import { UserProvider } from "./hooks/userContext"


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <Home></Home>
            } />
            <Route
              path="/login"
              element={
                  <Login></Login>
              }
            />
            <Route
              path="/register"
              element={
                  <Register></Register>
              }
            />
          </Routes>
        </Router>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
