import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children, role }) {
  const { token, user } = useAuth()

  if (!token) return <Navigate to="/login" replace />
  if (role && user?.rol !== role) return <Navigate to="/login" replace />

  return children
}