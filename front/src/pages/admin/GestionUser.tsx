// GestionUser.tsx
import { useEffect, useState } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/hooks/api"
import { getRankBadge, getUserColor } from "@/hooks/userContext"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import CustomBreadcrumb from "@/components/Breadcrumb"
import type { User } from "@/Models/User"


const rankOrder = { admin: 0, mod: 1, guest: 2 }

export default function GestionUser() {
  const [users, setUsers] = useState<User[]>([])

  const fetchUsers = async () => {
    try {
      const res = await api("/users", "GET")
      const sorted = [...res].sort((a: User, b: User) => {
        const rankCompare = rankOrder[a.rank] - rankOrder[b.rank]
        if (rankCompare !== 0) return rankCompare
        return a.name.localeCompare(b.name)
      })
      setUsers(sorted)
    } catch (err) {
      console.error("Erreur users:", err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

    const toggleValidation = async (id: number, value: boolean, name: string) => {
    try {
        await api(`/users/${id}/validate`, "PUT", { is_validated: value })
        fetchUsers()
        toast(`Validation ${value ? "activée" : "désactivée"}`, {
        description: `Le compte de ${name} (#${id}) est maintenant ${value ? "validé" : "non validé"}.`,
        })
    } catch (err) {
        console.error(err)
        toast.error("Erreur lors de la modification de la validation")
    }
    }


    const updateRank = async (id: number, newRank: string) => {
    try {
        const user = users.find((u) => u.id === id)
        const oldRank = user?.rank || "inconnu"

        await api(`/users/${id}/rank`, "PUT", { rank: newRank })
        fetchUsers()

        toast(`Rang modifié`, {
        description: `Utilisateur ${user?.name} : ${oldRank} → ${newRank}`,
        })
    } catch (err) {
        console.error(err)
    }
    }


  return (
    <SidebarInset>
      <CustomBreadcrumb
        items={[
          { label: "Administration", href: "/" },
          { label: "Gestion des comptes" },
        ]}
      />
      <main className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>👥 Gestion des utilisateurs ({users.length})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nb Publications</TableHead>
                  <TableHead>Rang</TableHead>
                  <TableHead>Changer le rang</TableHead>
                  <TableHead>Validé</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.nb_publi}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs">
                          {getRankBadge(u.rank)}
                          <span className={getUserColor(u.rank)}>
                          {u.rank === "admin"
                              ? "Admin"
                              : u.rank === "mod"
                              ? "Modérateur"
                              : "Invité"}
                          </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Select defaultValue={u.rank} onValueChange={(v) => updateRank(u.id, v)}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Rang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="guest">Invité</SelectItem>
                          <SelectItem value="mod">Mod</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={u.is_validated}
                        onCheckedChange={(val) => toggleValidation(u.id, val, u.name)}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(u.created_at).toLocaleString("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </SidebarInset>
  )
}
