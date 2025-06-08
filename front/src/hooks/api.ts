let token: string | null = localStorage.getItem("authToken")

export const setAuthToken = (t: string) => {
  token = t
  localStorage.setItem("authToken", t)
}

export const getAuthToken = () => token

export const api = async (
  endpoint: string,
  method: string = "GET",
  data?: any
) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: method !== "GET" ? JSON.stringify(data) : undefined,
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.error || "Erreur serveur")
  return json
}
