"use client"

import { useEffect, useState } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
import { TrashIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { api } from "@/hooks/api"
import CustomBreadcrumb from "@/components/Breadcrumb"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

interface Genre {
  id: number
  name: string
  nb_publi?: number
}

interface Publication {
  id: number
  title: string
  artist: string
}

export default function GestionGenre() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [loadingIds, setLoadingIds] = useState<number[]>([])
  const [newGenre, setNewGenre] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  // pour le Dialog dynamique
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)
  const [linkedPublications, setLinkedPublications] = useState<Publication[]>([])
  const [loadingLinkedPubs, setLoadingLinkedPubs] = useState(false)

  useEffect(() => {
    fetchGenres()
  }, [])

  const fetchGenres = () => {
    api("/genres", "GET")
      .then(setGenres)
      .catch((err) => {
        console.error("Erreur genres:", err)
        toast.error("Erreur lors du chargement des genres")
      })
  }

  const fetchLinkedPublications = async (genre: Genre) => {
    setSelectedGenre(genre)
    setLoadingLinkedPubs(true)
    try {
      const pubs = await api(`/publications/getbygenreid/${genre.id}`, "GET")
      setLinkedPublications(pubs)
    } catch (err) {
      toast.error("Erreur chargement publications liées")
      setLinkedPublications([])
    } finally {
      setLoadingLinkedPubs(false)
    }
  }

  const handleDelete = async (id: number) => {
    setLoadingIds((prev) => [...prev, id])
    try {
      await api(`/genres/${id}`, "DELETE")
      setGenres((prev) => prev.filter((g) => g.id !== id))
      toast.success("Genre supprimé", {
        description: `Le genre #${id} a été supprimé avec succès.`,
      })
    } catch (err) {
      console.error("Erreur suppression:", err)
      toast.error("Erreur lors de la suppression")
    } finally {
      setLoadingIds((prev) => prev.filter((i) => i !== id))
      setSelectedGenre(null)
      setLinkedPublications([])
    }
  }

  const handleAdd = async () => {
    if (!newGenre.trim()) return
    setIsAdding(true)
    try {
      const added = await api("/genres", "POST", { name: newGenre })
      setGenres((prev) => [...prev, added])
      setNewGenre("")
      toast.success("Genre ajouté", {
        description: `${added.name} a été créé.`,
      })
    } catch (err) {
      toast.error("Erreur lors de l'ajout")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <SidebarInset>
      <CustomBreadcrumb
        items={[
          { label: "Administration", href: "/" },
          { label: "Gestion des genres" },
        ]}
      />

      <main className="p-4 space-y-6">
        <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>🎧 Liste des genres ({genres.length})</CardTitle>
            <form
                onSubmit={(e) => {
                e.preventDefault()
                handleAdd()
                }}
                className="flex gap-2"
            >
                <Input
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                placeholder="Nouveau genre"
                className="w-48"
                />
                <Button type="submit" disabled={isAdding}>
                <PlusIcon className="w-4 h-4 mr-1" />
                Ajouter
                </Button>
            </form>
            </CardHeader>


          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nb Publications</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Supprimer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {genres.map((genre) => (
                  <TableRow key={genre.id}>
                    <TableCell>#{genre.id}</TableCell>
                    <TableCell>{genre.nb_publi ?? 0}</TableCell>
                    <TableCell className="w-full">{genre.name}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => fetchLinkedPublications(genre)}
                            disabled={loadingIds.includes(genre.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Supprimer le genre</DialogTitle>
                            <DialogDescription>
                              Es-tu sûr de vouloir supprimer le genre{" "}
                              <strong>{genre.name}</strong> ?
                            </DialogDescription>
                          </DialogHeader>

                          <div className="text-sm text-muted-foreground mt-2">
                            {loadingLinkedPubs ? (
                              <Skeleton className="h-16 w-full" />
                            ) : linkedPublications.length ? (
                              <ScrollArea className="max-h-48 mt-2 border rounded p-2">
                                <div className="space-y-1">
                                  {linkedPublications.slice(0, 5).map((pub) => (
                                    <div key={pub.id} className="text-sm">
                                      • #{pub.id} — {pub.artist} -{" "}
                                      <strong>{pub.title}</strong>
                                    </div>
                                  ))}
                                  {linkedPublications.length > 5 && (
                                    <div className="text-xs text-muted-foreground mt-2 italic">
                                      + {linkedPublications.length - 5} autres...
                                    </div>
                                  )}
                                </div>
                              </ScrollArea>
                            ) : (
                              <p className="text-sm text-green-700 mt-2">
                                Ce genre n’est lié à aucune publication.
                              </p>
                            )}
                          </div>

                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(genre.id)}
                              disabled={loadingIds.includes(genre.id)}
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
