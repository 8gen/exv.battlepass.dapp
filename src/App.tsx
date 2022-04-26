import { Route, Routes, Navigate } from "react-router-dom";

import Whitelist from "./views/Whitelist";
import "./index.css";


export default function App() {
    return (
    <>
        <Routes>
            <Route path="/" element={<Whitelist />} />
            <Route path="/test/:mode" element={<Whitelist />} />
            <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
    </>
    );
}
