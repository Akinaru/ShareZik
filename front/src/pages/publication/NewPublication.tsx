import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command"
import {
  AlertCircle,
  AlertCircleIcon,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import CustomBreadcrumb from "@/components/Breadcrumb"
import { api } from "@/hooks/api"

interface Genre {
  id: number
  name: string
}

export default function NewPublication() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([])
  const [open, setOpen] = useState(false)
  const [link, setLink] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api("/genres", "GET").then(setGenres).catch(console.error)
  }, [])

  const toggleGenre = (id: number) => {
    setSelectedGenreIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  const getEmbedUrl = (link: string): string | null => {
    const spotifyMatch = link.match(/\/track\/([a-zA-Z0-9]+)\b/)
    if (spotifyMatch) return `https://open.spotify.com/embed/track/${spotifyMatch[1]}`

    const deezerMatch = link.match(/deezer\.com\/(?:\w{2}\/)?track\/(\d+)/)
    if (deezerMatch) return `https://widget.deezer.com/widget/dark/track/${deezerMatch[1]}`

    if (link.includes("youtube.com/watch?v=")) {
      const id = new URL(link).searchParams.get("v")
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (link.includes("youtu.be/")) {
      const id = link.split("youtu.be/")[1]?.split("?")[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (link.includes("soundcloud.com")) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(link)}&auto_play=false`
    }

    return null
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await api("/publications", "POST", {
        url: link,
        platform: "auto",
        title: "",
        artist: "",
        coverUrl: "",
        embedUrl: getEmbedUrl(link),
        tags: [],
        genreIds: selectedGenreIds,
      })
      alert("Publication ajoutée avec succès !")
      setLink("")
      setSelectedGenreIds([])
    } catch (e) {
      alert("Erreur lors de l'envoi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarInset>
      <CustomBreadcrumb
        items={[
          { label: "Publications", href: "/" },
          { label: "Ajouter une publication" },
        ]}
      />

      <main className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">🎶 Ajouter une publication</h1>
          <p className="text-sm text-muted-foreground">
            Partagez un lien vers une musique et sélectionnez les genres associés.
          </p>
        </div>

        <Alert>
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Plateformes autorisées</AlertTitle>
          <AlertDescription>
            Les plateformes autorisées pour les liens de musique sont :
            <ul className="list-inside list-disc text-sm mt-1">
              <li>Spotify</li>
              <li>Deezer</li>
              <li>YouTube</li>
              <li>SoundCloud</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle publication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link">Lien vers la musique</Label>
                <Input
                  id="link"
                  placeholder="https://open.spotify.com/track/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Genres</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {selectedGenreIds.length > 0
                        ? `${selectedGenreIds.length} genre(s) sélectionné(s)`
                        : "Sélectionner les genres"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Rechercher..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>Aucun genre trouvé.</CommandEmpty>
                        <CommandGroup>
                          {genres.map((genre) => (
                            <CommandItem
                              key={genre.id}
                              onSelect={() => toggleGenre(genre.id)}
                            >
                              {genre.name}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedGenreIds.includes(genre.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedGenreIds.map((id) => {
                    const genre = genres.find((g) => g.id === id)
                    return genre ? (
                      <div key={id} className="text-xs bg-muted px-2 py-1 rounded-full">
                        {genre.name}
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="button"
                disabled={!link || selectedGenreIds.length === 0 || loading}
                onClick={handleSubmit}
              >
                {loading ? "Publication..." : "Publier"}
              </Button>
            </CardFooter>
          </Card>

          {link === "" ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Pas encore de lien</AlertTitle>
              <AlertDescription>
                Ajoute un lien de musique ci-dessus pour générer une prévisualisation.
              </AlertDescription>
            </Alert>
          ) : getEmbedUrl(link) ? (
            <div className="rounded-lg overflow-hidden border shadow">
              <iframe
                className="w-full"
                height="160"
                allow="autoplay"
                src={getEmbedUrl(link)!}
              ></iframe>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Format invalide</AlertTitle>
              <AlertDescription>
                Ce lien ne semble pas valide ou n’est pas pris en charge pour l’aperçu.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </SidebarInset>
  )
}
