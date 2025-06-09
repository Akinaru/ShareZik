import { useEffect, useState } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import CustomBreadcrumb from "@/components/Breadcrumb"
import { api } from "@/hooks/api"
import { Skeleton } from "@/components/ui/skeleton"
import { getRankBadge, getUserColor } from "@/hooks/userContext"
import { TrashIcon } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"


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
  const [loadingIds, setLoadingIds] = useState<number[]>([])

  useEffect(() => {
    fetchPublications()
  }, [])

  const fetchPublications = () => {
    api("/publications", "GET")
      .then(setPublications)
      .catch((err) => console.error("Erreur publications:", err))
  }

  const handleDelete = async (id: number) => {
    setLoadingIds((prev) => [...prev, id])
    try {
      await api(`/publications/${id}`, "DELETE")
      setPublications((prev) => prev.filter((p) => p.id !== id))
      toast("Publication supprimée", {
        description: `L'élément #${id} a été définitivement supprimé.`,
      })

    } catch (err) {
      console.error("Erreur suppression:", err)
    } finally {
      setLoadingIds((prev) => prev.filter((i) => i !== id))
    }
  }

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
                  <TableHead>Cover</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Artiste</TableHead>
                  <TableHead>Genres</TableHead>
                  <TableHead>Plateforme</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Voir</TableHead>
                  <TableHead>Supprimer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publications.map((pub) => (
                  <TableRow key={pub.id}>
                    <TableCell>
                      {pub.coverUrl ? (
                        <img
                          src={pub.coverUrl}
                          alt={pub.title || "cover"}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.onerror = null
                            target.src = "/placeholder.png"
                          }}
                        />
                      ) : (
                        <Skeleton className="w-12 h-12 rounded" />
                      )}
                    </TableCell>

                    <TableCell>{pub.id}</TableCell>
                    <TableCell>{pub.title || "-"}</TableCell>
                    <TableCell>{pub.artist || "-"}</TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {pub.genres.slice(0, 3).map((genre) => (
                          <Badge
                            key={genre.id}
                            variant="outline"
                            className="text-[10px] px-2 py-0.5"
                          >
                            {genre.name}
                          </Badge>
                        ))}
                        {pub.genres.length > 3 && (
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                            +{pub.genres.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{pub.platform}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-xs pt-3">
                        {getRankBadge(pub.user.rank)}
                        <span className={`truncate ${getUserColor(pub.user.rank)}`}>
                          {pub.user.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {new Date(pub.createdAt).toLocaleString("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </TableCell>

                    <TableCell>
                      <Button size="sm" variant="outline" asChild>
                        <a href={pub.url} target="_blank" rel="noopener noreferrer">
                          Voir
                        </a>
                      </Button>
                    </TableCell>

                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="destructive"
                            disabled={loadingIds.includes(pub.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirmer la suppression</DialogTitle>
                            <DialogDescription>
                              Cette action est irréversible. La publication <strong>{pub.title}</strong> sera définitivement supprimée.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(pub.id)}
                              disabled={loadingIds.includes(pub.id)}
                            >
                              Supprimer
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
