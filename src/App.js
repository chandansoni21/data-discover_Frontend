import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './components/LandingPage';
import Home from './components/Home';
import ChatPage from './components/ChatPage';
import UnifiedChatPage from './components/UnifiedChatPage';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import { IDManager } from './utils/api';
import { Toaster } from 'react-hot-toast';

function App() {
  useEffect(() => {
    // Ensure session ID exists
    IDManager.getSessionId();
  }, []);

  return (
    <ThemeProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            zIndex: 9999,
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:dbName" element={<ChatPage />} />
          <Route path="/unified-chat/:dbName" element={<UnifiedChatPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
