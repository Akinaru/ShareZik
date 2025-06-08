import {
  BookOpen,
  Folder,
  GalleryVerticalEnd,
  HomeIcon,
  Music2,
  Upload,
  Users,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-users"

const items = [
  {
    title: "Accueil",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Découvrir",
    url: "/discover",
    icon: Music2,
  },
  {
    title: "Publications",
    url: "/publications",
    icon: Upload,
  },
  {
    title: "Communauté",
    url: "/community",
    icon: Users,
  },
  {
    title: "Genres",
    url: "/genres",
    icon: Folder,
  },
  {
    title: "À propos",
    url: "/about",
    icon: BookOpen,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()

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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    isActive={location.pathname === item.url}
                  >
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon className="mr-2 size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
