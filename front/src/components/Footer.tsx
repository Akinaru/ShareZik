import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function Footer() {
  const [dateTime, setDateTime] = useState<string>("")

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
      setDateTime(now.toLocaleString("fr-FR", options))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="w-full mt-auto">
      <Card className={cn("rounded-none border-t-2 border-muted-foreground/10 shadow-none bg-background py-3 px-4")}> 
        <div className="flex flex-row items-center justify-between w-full text-sm text-muted-foreground">
          <span className="">ShareZik</span>
          <span className="tabular-nums select-none">{dateTime}</span>
          <span className="text-right">Tous droits réservés</span>
        </div>
      </Card>
    </footer>
  )
}
