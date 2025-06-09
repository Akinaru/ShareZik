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
import { useUser } from "@/hooks/userContext"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { AlertCircleIcon, Loader2Icon } from "lucide-react"

interface ErrorObject {
  icon: React.ReactNode
  title: React.ReactNode
  description: React.ReactNode
}

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ErrorObject | null>(null)
  const [invalidName, setInvalidName] = useState(false)

  const navigate = useNavigate()
  const { setUser } = useUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[a-zA-Z0-9_]{4,16}$/.test(name)) {
      setInvalidName(true)
      setError({
        icon: <AlertCircleIcon className="h-4 w-4" />,
        title: "Erreur, nom invalide :",
        description: (
          <ul className="list-inside list-disc text-sm mt-1">
            <li>16 caractères maximum (4 minimum)</li>
            <li>Pas d'espaces</li>
            <li>Uniquement lettres, chiffres et underscore (_)</li>
          </ul>
        ),
      })
      return
    }

    setInvalidName(false)
    setError(null)
    setLoading(true)

    try {
      const res = await api("/register", "POST", { name, email, password })
      setAuthToken(res.token)
      const user = await api("/me", "GET")
      setUser(user)
      navigate("/")
    } catch (err: any) {
      console.log(err)
      setError({
        icon: <AlertCircleIcon className="h-4 w-4" />,
        title: "Une erreur est survenue :",
        description: err.message || "Une erreur est survenue lors de la création du compte.",
      })
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
                <Button variant="outline" className="w-full cursor-pointer" disabled>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
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
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const value = e.target.value
                    setName(value)
                    setInvalidName(false)
                    setError(null)
                  }}
                  className={cn({ "border-destructive": invalidName })}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  {error.icon}
                  <AlertTitle>{error.title}</AlertTitle>
                  <AlertDescription>{error.description}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                    Création...
                  </div>
                ) : (
                  "Créer un compte"
                )}
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
