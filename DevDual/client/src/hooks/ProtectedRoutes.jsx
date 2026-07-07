import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import PageLoader from "../components/PageLoader";

function ProtectedRoute({ children }) {
  const { userData } = useUser();
  const location = useLocation();

  if (userData === undefined) {
    return <PageLoader />;
  }

  if (!userData) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
