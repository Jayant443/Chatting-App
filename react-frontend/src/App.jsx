import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';

function App() {
    const isAuthenticated = !!localStorage.getItem("token");
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element = {isAuthenticated ? <Navigate to="/chat" replace /> : <Login />}></Route>
            <Route path="/signup" element={<Signup />}></Route>
            <Route path="/chat" element={isAuthenticated ? <Chat /> : <Navigate to="/login" replace />}></Route>
        </Routes>
    )
}

export default App;