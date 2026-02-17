import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

type ProtectedRouteProps = {
    isAuthenticated: boolean;
    children: ReactElement;
};

const ProtectedRoute = ({ isAuthenticated, children }: ProtectedRouteProps) => {
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default ProtectedRoute;
