import { useState } from 'react'
import './App.css'
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

function App() {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user'))
    );

    return (
        <BrowserRouter>
            <AppRoutes user={user} setUser={setUser} />
        </BrowserRouter>
    );
}

export default App;