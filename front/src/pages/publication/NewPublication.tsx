import {
  Alert, AlertDescription, AlertTitle,
} from "@/components/ui/alert"
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {
  Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty,
} from "@/components/ui/command"
import {
  AlertCircle, AlertCircleIcon, Check, ChevronsUpDown,
} from "lucide-react"
import CustomBreadcrumb from "@/components/Breadcrumb"
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useCreatePublication } from "@/hooks/useCreatePublication"
import { cn } from "@/lib/utils"

export default function NewPublication() {
  const {
    genres, selectedGenreIds, link, platform, loading,
    setLink, setPlatform, toggleGenre, handleSubmit, getEmbedUrl,
  } = useCreatePublication()

  return (
    <SidebarInset>
      <CustomBreadcrumb items={[{ label: "Publications", href: "/" }, { label: "Ajouter une publication" }]} />

      <main className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">🎶 Ajouter une publication</h1>
          <p className="text-sm text-muted-foreground">Partage un lien vers une musique et sélectionne les genres associés.</p>
        </div>

        <Alert>
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Plateformes autorisées</AlertTitle>
          <AlertDescription>
            Les plateformes autorisées pour les liens de musique sont :
            <ul className="list-inside list-disc text-sm mt-1">
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
                  placeholder="https://soundcloud.com/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Plateforme</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir une plateforme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Plateformes</SelectLabel>
                      <SelectItem value="soundcloud">SoundCloud</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Genres</Label>
                <Popover>
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
                            <CommandItem key={genre.id} onSelect={() => toggleGenre(genre.id)}>
                              {genre.name}
                              <Check
                                className={cn("ml-auto h-4 w-4", selectedGenreIds.includes(genre.id) ? "opacity-100" : "opacity-0")}
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
                      <div
                        key={id}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-muted-foreground text-muted-foreground"
                      >
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
                className="cursor-pointer w-full"
                disabled={!link || !platform || selectedGenreIds.length === 0 || loading}
                onClick={handleSubmit}
              >
                {loading ? "Publication..." : "Publier"}
              </Button>
            </CardFooter>
          </Card>

          {!link ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Pas encore de lien</AlertTitle>
              <AlertDescription>
                Ajoute un lien de musique ci-dessus pour générer une prévisualisation.
              </AlertDescription>
            </Alert>
          ) : getEmbedUrl(link) ? (
            <div className="rounded-lg overflow-hidden border shadow">
              <iframe className="w-full" height="160" allow="autoplay" src={getEmbedUrl(link)!}></iframe>
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
