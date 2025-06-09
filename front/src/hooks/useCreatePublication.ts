import { useState, useEffect } from "react"
import { api } from "@/hooks/api"
import { toast } from "sonner"

interface Genre {
  id: number
  name: string
}

export function useCreatePublication() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([])
  const [link, setLink] = useState("")
  const [platform, setPlatform] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api("/genres", "GET").then(setGenres).catch(console.error)
  }, [])

  const toggleGenre = (id: number) => {
    setSelectedGenreIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  const getEmbedUrl = (url: string): string | null => {
    if (url.includes("soundcloud.com")) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false`
    }
    return null
  }

  const getTrackMetadata = async (url: string, platform: string) => {
    if (platform === "soundcloud") {
      try {
        const res = await fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`)
        const data = await res.json()
        return {
          title: data.title,
          artist: data.author_name,
          coverUrl: data.thumbnail_url,
          embedUrl: getEmbedUrl(url),
        }
      } catch (err) {
        console.error("Erreur SoundCloud oEmbed", err)
      }
    }
    return {
      title: "",
      artist: "",
      coverUrl: "",
      embedUrl: getEmbedUrl(url),
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const meta = await getTrackMetadata(link, platform)

      await api("/publications", "POST", {
        url: link,
        platform,
        title: meta.title,
        artist: meta.artist,
        coverUrl: meta.coverUrl,
        embedUrl: meta.embedUrl,
        tags: [],
        genreIds: selectedGenreIds,
      })

      setLink("")
      setPlatform("")
      setSelectedGenreIds([])
      toast("Publication ajoutée avec succès !", {
        description: "Votre publication a été créée.",
      })
      
    } catch (err) {
      console.error(err)
      toast("Erreur lors de la publication.", {
        description: "Veuillez vérifier les informations saisies.",
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    genres,
    selectedGenreIds,
    link,
    platform,
    loading,
    setLink,
    setPlatform,
    toggleGenre,
    handleSubmit,
    getEmbedUrl,
  }
}
