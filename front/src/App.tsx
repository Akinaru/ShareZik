import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import Login from "./pages/login"
import Register from "./pages/register"


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
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
          <Route
            path="/app"
            element={<div className="text-white p-10">Zone connectée 🧠</div>}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
