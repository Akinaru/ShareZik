"use client"

import * as React from "react"
import {
  BookOpen,
  Folder,
  GalleryVerticalEnd,
  HomeIcon,
  Music2,
  Settings2,
  Upload,
  User,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-users"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Accueil",
      url: "/",
      icon: HomeIcon,
      isActive: true,
      items: [],
    },
    {
      title: "Découvrir",
      url: "/discover",
      icon: Music2,
      items: [
        { title: "Derniers partages", url: "/discover/latest" },
        { title: "Tendances", url: "/discover/trending" },
        { title: "Catégories", url: "/discover/categories" },
      ],
    },
    {
      title: "Publications",
      url: "/publication",
      icon: Upload,
      items: [
        { title: "Les publications", url: "/publications" },
        { title: "Nouvelle musique", url: "/publications/new" },
        { title: "Mes partages", url: "/publications/mine" },
      ],
    },
    {
      title: "Communauté",
      url: "/community",
      icon: Users,
      items: [
        { title: "Utilisateurs", url: "/community/users" },
        { title: "Commentaires", url: "/community/comments" },
      ],
    },
    {
      title: "Genres",
      url: "/genres",
      icon: Folder,
      items: [
      ],
    },
    {
      title: "À propos",
      url: "/about",
      icon: BookOpen,
      items: [
        { title: "Fonctionnement", url: "/about/how-it-works" },
        { title: "Équipe", url: "/about/team" },
        { title: "Contact", url: "/about/contact" },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="gap-3 cursor-default">
                <div className="bg-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">ShareZik</span>
                </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser  />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
