import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element = {<Login />}></Route>
            <Route path="/signup" element={<Signup />}></Route>
            <Route path="/chat" element={<Chat />}></Route>
        </Routes>
    )
}

export default App;