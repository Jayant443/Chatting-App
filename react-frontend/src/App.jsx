import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';
import ProtectedRoute from './ProtectedRoute';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />}></Route>
            <Route path="/signup" element={<Signup />}></Route>
            <Route path="/chat" element={<ProtectedRoute> <Chat /> </ProtectedRoute>}></Route>
        </Routes>
    )
}

export default App;