import {
  BookOpen,
  Folder,
  GalleryVerticalEnd,
  Music2,
  PlusCircle,
  Users,
  ShieldCheck,
  LayoutDashboard,
  Contact,
} from "lucide-react"
import { Link } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-users"
import { useUser, isAdmin, isValidated } from "@/hooks/userContext"

const items = [
  {
    title: "Découvrir",
    url: "/discover",
    icon: Music2,
  },
  {
    title: "Publications",
    url: "/publications",
    icon: LayoutDashboard,
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

const itemsAction = [
  {
    title: "Ajouter une publication",
    icon: PlusCircle,
    url: "/publications/new",
  },
]

const adminItems = [
  {
    title: "Gestion utilisateurs",
    icon: ShieldCheck,
    url: "/admin/users",
  },
  {
    title: "Gestion publications",
    icon: LayoutDashboard,
    url: "/admin/publications",
  },
  {
    title: "Gestion genres",
    icon: Folder,
    url: "/admin/genres",
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="gap-3 cursor-pointer">
              <Link to="/" className="flex w-full items-center gap-3">
                <div className="bg-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ShareZik</span>
                </div>
              </Link>
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

        {isValidated(user) && (
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsAction.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {isAdmin(user) && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                  >
                    <SidebarMenuButton asChild>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
                <SidebarMenuItem
                >
                  <SidebarMenuButton asChild>
                    <Link to="/contact">
                      <Contact className="mr-2 size-4" />
                      <span>Contact</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
