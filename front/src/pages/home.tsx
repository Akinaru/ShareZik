import { useEffect, useState } from "react"
import { api } from "@/hooks/api"
import { SidebarInset } from "@/components/ui/sidebar"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Music2 } from "lucide-react"
import CustomBreadcrumb from "@/components/Breadcrumb"
import { CardPublication, type Genre } from "@/components/CardPublication"
import { Badge } from "@/components/ui/badge"


interface Publication {
  id: number
  title: string
  artist: string
  url: string
  embedUrl: string
  coverUrl: string
  createdAt: string
  user: {
    name: string
    avatar?: string
    rank: string
  }
  genres: Genre[]
}

export default function Home() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [topGenres, setTopGenres] = useState<Genre[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [publi, genres] = await Promise.all([
          api("/publications/last"),
          api("/genres/top"),
        ])
        setPublications(publi)
        setTopGenres(genres)
      } catch (err) {
        console.error("Erreur récupération données", err)
      }
    }

    fetchData()
  }, [])

  return (
    <SidebarInset>
      <CustomBreadcrumb items={[{ label: "Accueil" }]} />

      <main className="p-4">
        <div className="flex flex-col gap-10">
          {/* Dernières publications */}
          <section>
            <div className="mb-4 space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">🎧 Dernières publications</h2>
              <p className="text-sm text-muted-foreground">
                Les derniers sons partagés par la communauté.
              </p>
            </div>
            <Carousel className="w-full">
              <CarouselContent className="-ml-4">
                {publications.map((publication, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-4 sm:basis-1/2 md:basis-1/4 lg:basis-1/6"
                  >
                    <CardPublication
                      id={publication.id}
                      title={publication.title}
                      artist={publication.artist}
                      url={publication.url}
                      coverUrl={publication.coverUrl}
                      user={publication.user}
                      createdAt={publication.createdAt}
                      genres={publication.genres || []}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </section>

          {/* Genres populaires */}
          <section>
            <div className="mb-4 space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">🔥 Genres populaires</h2>
              <p className="text-sm text-muted-foreground">
                Explore les styles que la communauté aime partager.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topGenres.map((genre) => (
                <div
                  key={genre.id}
                  className="relative group flex items-center justify-center rounded-xl border bg-muted p-4 text-center shadow-sm transition hover:shadow-md hover:bg-background cursor-pointer"
                >
                  <Music2 className="mr-2 h-4 w-4 text-primary opacity-60 group-hover:animate-pulse" />
                  <span className="text-sm font-medium text-foreground">{genre.name}</span>

                  {genre.publication_count && (
                    <Badge className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5">
                      {genre.publication_count}
                    </Badge>
                  )}
                </div>
              ))}
            </div>

          </section>

          {/* CTA */}
          <section>
            <div className="mb-4 space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">✨ À découvrir</h2>
              <p className="text-sm text-muted-foreground">
                Tu viens de tomber sur un bijou sonore ?
              </p>
            </div>
            <Button asChild>
              <a href="/publications/new">Partager une musique</a>
            </Button>
          </section>
        </div>
      </main>
    </SidebarInset>
  )
}
