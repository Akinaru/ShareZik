import { useEffect, useState } from "react"
import { api } from "@/hooks/api"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarInset } from "@/components/ui/sidebar"
import CustomBreadcrumb from "@/components/Breadcrumb"
import { getRankBadge, getUserColor } from "@/hooks/userContext"
import { CardPublication } from "@/components/CardPublication"

interface Publication {
  id: number
  title: string
  artist: string
  url: string
  embedUrl: string
  coverUrl: string
  user: {
    name: string
    avatar: string
    rank: string
  }
  categories: { id: number; name: string }[]
}

export default function Publications() {
  const [tracks, setTracks] = useState<Publication[]>([])

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const data = await api("/publications")
        setTracks(data)
      } catch (err) {
        console.error("Erreur récupération publications", err)
      }
    }

    fetchTracks()
  }, [])

  return (
    <SidebarInset>
      <CustomBreadcrumb items={[{ label: "Publications" }]} />

      <main className="p-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">🎶 Publications</h1>
            <p className="text-sm text-muted-foreground">
                Découvre les dernières publications musicales de la communauté.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {tracks.map((track) => (
            <CardPublication
                key={track.id}
                id={track.id}
                title={track.title}
                artist={track.artist}
                url={track.url}
                coverUrl={track.coverUrl}
                user={track.user}
                categories={track.categories || []}
            />
            ))}
          </div>
        </div>
      </main>
    </SidebarInset>
  )
}
