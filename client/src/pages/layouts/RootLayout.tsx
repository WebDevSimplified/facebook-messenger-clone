import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export function RootLayout() {
  const { user } = useAuth()
  if (user == null) return <Navigate to="/login" />

  return <Outlet />
}
