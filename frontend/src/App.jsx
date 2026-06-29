import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/alumno/Dashboard'
import Admin from './pages/admin/Admin'
import TutorDashboard from './pages/tutor/Dashboard'
import DetalleAlumno from './pages/tutor/DetalleAlumno'

export default function App() {
  return (
  
    
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Alumno */}
      <Route path="/dashboard" element={
        <PrivateRoute role="alumno"><Dashboard /></PrivateRoute>
      } />

      {/* Tutor */}
      <Route path="/tutor/dashboard" element={
        <PrivateRoute role="tutor"><TutorDashboard /></PrivateRoute>
      } />

      <Route path="/tutor/alumnos/:id" element={
        <PrivateRoute role="tutor"><DetalleAlumno /></PrivateRoute>
      } />

      <Route path="/tutor/dashboard" element={
        <PrivateRoute role="tutor"><TutorDashboard /></PrivateRoute>
      } />

      {/* Admin — sin link público, solo quien sabe la URL */}
      <Route path="/admin" element={
        <PrivateRoute role="admin"><Admin /></PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}