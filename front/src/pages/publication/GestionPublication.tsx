import { useEffect, useState } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import CustomBreadcrumb from "@/components/Breadcrumb"
import { api } from "@/hooks/api"

interface Publication {
  id: number
  title: string
  artist: string
  url: string
  embedUrl: string
  platform: string
  coverUrl?: string
  createdAt: string
  user: {
    name: string
    rank: string
  }
  genres: { id: number; name: string }[]
}

export default function GestionPublication() {
  const [publications, setPublications] = useState<Publication[]>([])

  useEffect(() => {
    api("/publications", "GET")
      .then(setPublications)
      .catch((err) => console.error("Erreur publications:", err))
  }, [])

  return (
    <SidebarInset>
      <CustomBreadcrumb
        items={[
          { label: "Administration", href: "/" },
          { label: "Gestion des publications" },
        ]}
      />

      <main className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>📚 Toutes les publications ({publications.length})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Artiste</TableHead>
                  <TableHead>Genres</TableHead>
                  <TableHead>Plateforme</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publications.map((pub) => (
                  <TableRow key={pub.id}>
                    <TableCell>{pub.id}</TableCell>
                    <TableCell>{pub.title || "-"}</TableCell>
                    <TableCell>{pub.artist || "-"}</TableCell>
                    <TableCell className="flex flex-wrap gap-1">
                      {pub.genres.map((g) => (
                        <Badge key={g.id} variant="outline" className="text-[10px] px-2 py-0.5">
                          {g.name}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>{pub.platform}</TableCell>
                    <TableCell>
                      {pub.user.name} <span className="text-xs text-muted-foreground">({pub.user.rank})</span>
                    </TableCell>
                    <TableCell>{new Date(pub.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" asChild>
                        <a href={pub.url} target="_blank" rel="noopener noreferrer">Voir</a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </SidebarInset>
  )
}
