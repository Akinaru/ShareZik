import { useState } from "react"
import { cn } from "@/lib/utils"
import { api, setAuthToken } from "@/hooks/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    

    try {
      const res = await api("/register", "POST", { name, email, password })
      setAuthToken(res.token) // Optionnel : tu peux connecter direct après
      navigate("/login")
    } catch (err: any) {
      setError(err.message || "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">👋 Bienvenue parmi nous !</CardTitle>
          <CardDescription>
            Crée un compte pour rejoindre la communauté ShareZik.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full" disabled>
                  Créer un compte avec Google
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Ou crée un compte avec ton email
                </span>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Création..." : "Créer un compte"}
              </Button>
              <div className="text-center text-sm">
                Déjà inscrit ?{" "}
                <Link to="/login" className="underline underline-offset-4">Connecte-toi</Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        En créant un compte, vous acceptez nos <a href="#">Conditions d'utilisation</a> et notre <a href="#">Politique de confidentialité</a>.
      </div>
    </div>
  )
}
