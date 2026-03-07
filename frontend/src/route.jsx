import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Home from "./pages/Home";
import QuestionSelect from "./pages/QuestionSelect";
import Practice from "./pages/Practice";
import Scorecard from "./pages/Scorecard";
import SessionRecap from "./pages/SessionRecap";

export const router = createBrowserRouter([
    {
        path: "/login",
        Component: Login,
    },
    {
        path: "/",
        Component: Home,
    }
]);