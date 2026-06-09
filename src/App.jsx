import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import BridesmaidPage from "./pages/BridesmaidPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/bridesmaid/:id" element={<BridesmaidPage />} />
      </Routes>
    </BrowserRouter>
  );
}