// components/CardPublication.tsx
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getRankBadge, getUserColor } from "@/hooks/userContext"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useState } from "react"
import { Skeleton } from "./ui/skeleton"

interface Genre {
  id: number
  name: string
}

interface User {
  name: string
  rank: string
}

interface CardPublicationProps {
  id: number
  title: string
  artist: string
  url: string
  coverUrl: string
  user: User
  genres: Genre[]
  createdAt: string
}

export function CardPublication({
  id,
  title,
  artist,
  url,
  coverUrl,
  user,
  genres,
  createdAt,
}: CardPublicationProps) {
const formattedDate = createdAt
  ? format(new Date(createdAt), "dd MMMM yyyy à HH:mm", { locale: fr })
  : null
const [isImgError, setIsImgError] = useState(false)

  return (
    <a
      key={id}
      href={url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full"
    >
      <Card className="overflow-hidden h-full hover:shadow-md transition py-0 select-none">
        <CardHeader className="p-0">
        <div className="aspect-square w-full bg-muted relative">
            {isImgError || !coverUrl ? (
            <Skeleton className="w-full h-full" />
            ) : (
            <img
                src={coverUrl}
                alt={title || "Aucune image"}
                className="w-full h-full object-cover"
                onError={() => setIsImgError(true)}
            />
            )}
        </div>
        </CardHeader>
        <CardContent className="px-3 pt-3 pb-1 space-y-1.5">
            <div className="text-[10px] text-muted-foreground -mt-2">
            {formattedDate ? formattedDate : "Date inconnue"}
            </div>

          <h3 className="text-sm font-semibold leading-tight truncate">
            {title?.length > 0
              ? title.length > 35
                ? `${title.slice(0, 35)}…`
                : title
              : "Titre inconnu"}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {artist?.length > 0
              ? artist.length > 35
                ? `${artist.slice(0, 35)}…`
                : artist
              : "Artiste inconnu"}
          </p>
          <div className="flex items-center gap-2 text-xs pt-3">
            {getRankBadge(user?.rank || "guest")}
            <span className={`truncate ${getUserColor(user?.rank || "guest")}`}>
              {user?.name || "Anonyme"}
            </span>
          </div>
        </CardContent>
        <CardFooter className="px-3 pb-3 flex flex-wrap gap-1">
          {(genres || []).slice(0, 3).map((genre, i) => (
            <Badge
              key={i}
              variant="outline"
              className="text-[10px] px-2 py-0.5"
            >
              {genre.name}
            </Badge>
          ))}
          {(genres || []).length > 3 && (
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0.5"
            >
              +{(genres || []).length - 3}
            </Badge>
          )}
        </CardFooter>
      </Card>
    </a>
  )
}
