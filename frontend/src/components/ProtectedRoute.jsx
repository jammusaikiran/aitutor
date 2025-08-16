import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRef } from "react";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const hasShownToast = useRef(false);

  if (!token) {
    if (!hasShownToast.current) {
      toast.error("Please login first");
      hasShownToast.current = true;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
