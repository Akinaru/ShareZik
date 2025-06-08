import { useEffect, useState } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Music2 } from "lucide-react"
import CustomBreadcrumb from "@/components/Breadcrumb"
import { api } from "@/hooks/api"

interface Genre {
  id: number
  name: string
}

export default function Genres() {
  const [genres, setGenres] = useState<Genre[]>([])

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await api("/genres")
        setGenres(data)
      } catch (err) {
        console.error("Erreur récupération genres", err)
      }
    }
    fetchGenres()
  }, [])

  return (
    <SidebarInset>
      <CustomBreadcrumb
        items={[
          { label: "Genres" },
        ]}
      />

      <main className="p-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">🎶 Genres disponibles</h1>
            <p className="text-sm text-muted-foreground">
              Découvre tous les styles musicaux partagés par la communauté.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {genres.map((genre) => (
              <div
                key={genre.id}
                className="group flex items-center justify-center rounded-xl border bg-muted p-4 text-center shadow-sm transition hover:shadow-md hover:bg-background cursor-pointer"
              >
                <Music2 className="mr-2 h-4 w-4 text-primary opacity-60 group-hover:animate-pulse" />
                <span className="text-sm font-medium text-foreground">{genre.name}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </SidebarInset>
  )
}
