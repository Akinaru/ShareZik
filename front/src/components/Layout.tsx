import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
        {children}
    </SidebarProvider>
  )
}
