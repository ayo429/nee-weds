import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import BridesmaidPage from "./pages/BridesmaidPage";
import AdminPage from "./pages/AdminPage";
import ChatPage from "./pages/ChatPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/bridesmaid/:id" element={<BridesmaidPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}