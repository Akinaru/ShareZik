import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useUser } from "@/hooks/userContext"

export default function Layout({ children }: { children: ReactNode }) {
  const { user } = useUser()

  return (
    <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col w-full">
          {!user?.is_validated && (
            <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-4 py-2 text-sm text-center">
              ⚠️ Ton compte n’est pas encore validé. Tu es actuellement en mode lecture seule.
            </div>
          )}
          <div className="flex-1">{children}</div>
        </div>

    </SidebarProvider>
  )
}
