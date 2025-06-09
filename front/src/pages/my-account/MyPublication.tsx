// src/pages/MyPublication.tsx
"use client"

import { useEffect, useState } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api } from "@/hooks/api"
import { useUser } from "@/hooks/userContext"
import CustomBreadcrumb from "@/components/Breadcrumb"

interface Genre {
  id: number
  name: string
}

interface Publication {
  id: number
  title: string
  artist: string
  url: string
  coverUrl?: string
  createdAt: string
  platform: string
  genres: Genre[]
}

export default function MyPublication() {
  const { user } = useUser()
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api("/publications/my", "GET")
        setPublications(data)
      } catch (err) {
        console.error("Erreur chargement publications:", err)
      } finally {
        setLoading(false)
      }
    }

    if (user) fetch()
  }, [user])

  return (
    <SidebarInset>
      <CustomBreadcrumb items={[{ label: "Mon Compte", href: "/my-account" }, { label: "Mes publications" }]} />
      <main className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🎧 Mes publications</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[180px] w-full rounded-xl" />
                ))
              : publications.map((pub) => (
                  <div
                    key={pub.id}
                    className="group rounded-xl border bg-muted p-4 shadow-sm transition hover:shadow-md hover:bg-background"
                  >
                    <div className="flex items-center gap-4">
                      {pub.coverUrl ? (
                        <img
                          src={pub.coverUrl}
                          alt={pub.title}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement
                            t.onerror = null
                            t.src = "/placeholder.png"
                          }}
                        />
                      ) : (
                        <Skeleton className="w-16 h-16 rounded" />
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="font-semibold">{pub.title}</div>
                        <div className="text-sm text-muted-foreground">{pub.artist}</div>
                        <div className="text-xs text-muted-foreground">{pub.platform}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {pub.genres.map((g) => (
                        <Badge key={g.id} variant="outline" className="text-[10px] px-2 py-0.5">
                          {g.name}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="link"
                      className="mt-2 px-0 text-sm"
                      asChild
                    >
                      <a href={pub.url} target="_blank" rel="noopener noreferrer">
                        Voir la publication
                      </a>
                    </Button>
                  </div>
                ))}
          </CardContent>
        </Card>
      </main>
    </SidebarInset>
  )
}
