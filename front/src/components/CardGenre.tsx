import { Badge } from "@/components/ui/badge"

interface CardGenreProps {
  name: string
  nb_publi?: number
}

export function CardGenre({ name, nb_publi }: CardGenreProps) {
  return (
    <div className="group flex flex-col items-center justify-center gap-2 rounded-xl border bg-muted p-4 text-center shadow-sm transition hover:shadow-md hover:bg-background cursor-pointer">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span>{name}</span>
        {nb_publi !== undefined && (
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
            {nb_publi}
          </Badge>
        )}
      </div>
    </div>
  )
}
