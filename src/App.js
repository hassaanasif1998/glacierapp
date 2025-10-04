import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { Header } from "./utils/Header";
import Landing from "./components/Landing/Landing";

function NotFound() {
  return <div className="pt-24 text-white p-6">Not found</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* <Header /> */}
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
