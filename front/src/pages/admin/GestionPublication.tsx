// GestionPublication.tsx
"use client"

import { useEffect, useState } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import CustomBreadcrumb from "@/components/Breadcrumb"
import { api } from "@/hooks/api"
import { getRankBadge, getUserColor } from "@/hooks/userContext"

interface Genre {
  id: number
  name: string
}

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
  genres: Genre[]
}

export default function GestionPublication() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [loadingIds, setLoadingIds] = useState<number[]>([])

  useEffect(() => {
    fetchPublications()
    api("/genres", "GET").then(setGenres)
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

  const handleUpdateGenres = async (id: number, genreIds: number[]) => {
    try {
      await api(`/publications/${id}/genres`, "PUT", { genreIds })
      fetchPublications()
      toast.success("Genres mis à jour")
    } catch (err) {
      console.error(err)
      toast.error("Erreur lors de la mise à jour des genres")
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Modifier
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier les genres</DialogTitle>
                            <DialogDescription>
                              Sélectionne les genres associés à <strong>{pub.title}</strong>
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto py-2">
                            {genres.map((g) => {
                              const selected = pub.genres.some((pg) => pg.id === g.id)
                              return (
                                <Button
                                  key={g.id}
                                  size="sm"
                                  variant={selected ? "default" : "outline"}
                                  onClick={() => {
                                    const newIds = selected
                                      ? pub.genres.filter((pg) => pg.id !== g.id).map((pg) => pg.id)
                                      : [...pub.genres.map((pg) => pg.id), g.id]
                                    handleUpdateGenres(pub.id, newIds)
                                  }}
                                >
                                  {g.name}
                                </Button>
                              )
                            })}
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Fermer</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {pub.genres.slice(0, 3).map((genre) => (
                          <Badge key={genre.id} variant="outline" className="text-[10px] px-2 py-0.5">
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