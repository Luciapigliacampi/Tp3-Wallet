import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Account from './pages/Account';
import Comprobante from './pages/Comprobante';
import Historial from './pages/Historial';
import Login from './pages/Login';
import Profile from './pages/Profile';
import RecoverTotp from './pages/RecoverTotp';
import Register from './pages/Register';
import Totp from './pages/Totp';
import Transfer from './pages/Transfer';
import VerifyAccount from './pages/VerifyAccount';
import './index.css';

function App() {
  return (
    <div className="container">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyAccount />} />
          <Route path="/recover" element={<RecoverTotp />} />
          <Route path="/totp" element={<Totp />} />
          <Route path="/account" element={<Account />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/comprobante" element={<Comprobante />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
