import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="wrap section"><p className="muted">Loading…</p></div>;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
}
