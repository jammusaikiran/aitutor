import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRef } from "react";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("token");
  const hasShownToast = useRef(false);

  if (!token) {
    if (!hasShownToast.current) {
      toast.error("Please login first");
      hasShownToast.current = true;
    }
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role;

    if (adminOnly && role !== "admin") {
      toast.error("Access denied. Admins only.");
      return <Navigate to="/" replace />;
    }
  } catch (err) {
    toast.error("Invalid token. Please login again.");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
