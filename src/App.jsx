import React from "react";
import { Routes, Route } from "react-router-dom";
import Tech from "./pages/Tech.jsx";
import NonTech from "./pages/NonTech.jsx";
import Register from "./pages/Register.jsx";
import Greeting from "./pages/Greeting.jsx";
import Admin from "./pages/Admin.jsx";
import PermissionLetter from "./pages/PermissionLetter.jsx";

const App = () => (
  <Routes>
    <Route path="/"         element={<Register />} />
    <Route path="/register" element={<Register />} />
    <Route path="/tech"     element={<Tech />} />
    <Route path="/nontech"  element={<NonTech />} />
    <Route path="/greeting" element={<Greeting />} />
    <Route path="/admin"    element={<Admin />} />
    <Route path="/permission-letter" element={<PermissionLetter />} />
  </Routes>
);

export default App;
