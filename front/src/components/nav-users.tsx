"use client"

import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
  Moon,
  Music2,
  Sun,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useUser } from "@/hooks/userContext"
import { useNavigate } from "react-router-dom"
import { clearAuthToken } from "@/hooks/api"
import { useTheme } from "@/components/theme-provider"

export function NavUser() {
  const { user, logout } = useUser()
  const { isMobile } = useSidebar()
  const { setTheme } = useTheme()
  const navigate = useNavigate()

  if (!user) return null

  const handleLogout = () => {
    navigate("/login")
    clearAuthToken()
    logout()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <div
                className={`h-8 w-8 flex items-center justify-center rounded-lg text-white font-semibold ${
                  user.rank === "admin"
                    ? "bg-red-500"
                    : user.rank === "mod"
                    ? "bg-blue-500"
                    : "bg-muted"
                }`}
              >
                {user.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>


          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div
                  className={`h-8 w-8 flex items-center justify-center rounded-lg text-white font-semibold ${
                    user.rank === "admin"
                      ? "bg-red-500"
                      : user.rank === "mod"
                      ? "bg-blue-500"
                      : "bg-muted"
                  }`}
                >
                  {user.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>


            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <BadgeCheck className="mr-2 size-4" />
                Mon compte
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Music2 className="mr-2 size-4" />
                Mes publications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Thème</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
              <Sun className="mr-2 size-4" /> Clair
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
              <Moon className="mr-2 size-4" /> Sombre
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 size-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
