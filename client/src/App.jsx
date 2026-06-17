import { useState } from 'react'
import './App.css'
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { getUser } from "./utils/authStorage";

function App() {
    const [user, setUser] = useState(getUser());

    return (
        <BrowserRouter>
            <AppRoutes user={user} setUser={setUser} />
        </BrowserRouter>
    );
}

export default App;