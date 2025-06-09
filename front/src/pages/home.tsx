import { useEffect, useState } from "react"
import { api } from "@/hooks/api"
import { SidebarInset } from "@/components/ui/sidebar"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import CustomBreadcrumb from "@/components/Breadcrumb"
import { CardPublication } from "@/components/CardPublication"
import { CardGenre } from "@/components/CardGenre"
import { Skeleton } from "@/components/ui/skeleton"
import type { Genre } from "@/Models/Genre"

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
  const [isLoadingPublications, setIsLoadingPublications] = useState(true)
  const [isLoadingGenres, setIsLoadingGenres] = useState(true)

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const publi = await api("/publications/last")
        setPublications(publi)
      } catch (err) {
        console.error("Erreur publications", err)
      } finally {
        setIsLoadingPublications(false)
      }
    }

    const fetchGenres = async () => {
      try {
        const genres = await api("/genres/top")
        setTopGenres(genres)
      } catch (err) {
        console.error("Erreur genres", err)
      } finally {
        setIsLoadingGenres(false)
      }
    }

    fetchPublications()
    fetchGenres()
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
                {isLoadingPublications
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <CarouselItem
                        key={index}
                        className="pl-4 sm:basis-1/2 md:basis-1/4 lg:basis-1/6"
                      >
                        <Skeleton className="h-96 rounded-xl" />
                      </CarouselItem>
                    ))
                  : publications.map((publication, index) => (
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
              {isLoadingGenres
                ? Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 rounded-xl" />
                  ))
                : topGenres.map((genre) => (
                    <CardGenre
                      key={genre.id}
                      name={genre.name}
                      nb_publi={genre.nb_publi}
                    />
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
