import { useEffect, useState } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import CustomBreadcrumb from "@/components/Breadcrumb"
import { api } from "@/hooks/api"
import { CardGenre } from "@/components/CardGenre"
import type { Genre } from "@/Models/Genre"


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
              <CardGenre
                key={genre.id}
                name={genre.name}
                nb_publi={genre.nb_publi}
              />
            ))}
          </div>
        </div>
      </main>
    </SidebarInset>
  )
}
