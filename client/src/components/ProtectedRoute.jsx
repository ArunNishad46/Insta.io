import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initialized } = useSelector((state) => state.auth);

  if(!initialized) {
    return (
    <div className="p-4">Loading...</div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}