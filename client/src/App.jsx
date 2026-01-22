import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Scan from './pages/Scan'
import { Toaster } from 'react-hot-toast'
import './App.css'

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </>
  )
}

export default App