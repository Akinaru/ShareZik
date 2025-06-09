export interface User {
  id: number
  name: string
  email: string
  nb_publi: number
  rank: "admin" | "mod" | "guest"
  created_at: string
  is_validated: boolean
}