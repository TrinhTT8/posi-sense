import { createBrowserRouter, Navigate, Outlet } from "react-router";
import Register from "./pages/Register";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import QuestionSelect from "./pages/QuestionSelect";
import Practice from "./pages/Practice";
import Scorecard from "./pages/Scorecard";
import ScoreBarDemo from "./ScoreBarDemo";

import SessionRecap from "./pages/SessionRecap";

// import AquariumUnlock from "./pages/AquariumUnlock";
import AquariumView from "./pages/AquariumView";

// Wrapper component to protect routes
function ProtectedRoute() {
    const { user, loading } = useAuth();
    if (loading) return null; // Optionally, render a spinner here
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
}

export const router = createBrowserRouter([
    {
        path: "/login",
        Component: Login,
    },
    {
        path: "/register",
        Component: Register,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                Component: Home,
            },
            {
                path: "/question-select",
                Component: QuestionSelect,
            },
            {
                path: "/practice",
                Component: Practice,
            },
            {
                path: "/scorecard",
                Component: Scorecard,
            },
            {
                path: "/session-recap",
                Component: SessionRecap,
            },
            {
                path: "/scorebar-demo",
                Component: ScoreBarDemo,
            },
            // AquariumUnlock route removed
            {
                path: "/aquarium-view",
                Component: AquariumView,
            },
        ]
    }
]);