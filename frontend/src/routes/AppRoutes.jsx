import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../views/Login.jsx";
import Dashboard from "../views/Dashboard.jsx";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;