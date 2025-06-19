import React, { useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const VerifyAccount = () => {
  const location = useLocation();
  const [alias, setAlias] = useState(location.state?.alias || '');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth0();

  const qrData = location.state?.qrData;
  const isNewUser = location.state?.isNewUser === true;

  const handleLogout = () => {
    sessionStorage.clear();
    logout({ returnTo: window.location.origin });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('https://raulocoin.onrender.com/api/verify-totp-setup', {
        username: alias,
        totpToken: codigo,
      });

      const res = response.data;

      if (res.success) {
        const user = res.user;
        sessionStorage.setItem('username', user.username);
        sessionStorage.setItem('name', user.name);
        sessionStorage.setItem('balance', user.balance);

        navigate('/account', {
          state: {
            username: user.username,
            name: user.name,
            balance: user.balance,
          },
        });
      } else {
        alert(res.message || 'Código incorrecto');
      }
    } catch (error) {
      console.error('Error al verificar código:', error);
      alert('Error al verificar el código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <img src="/assets/raulCoin.png" alt="raulCoin" className="logo-img" />
        <h1 className="auth-title">Verificá tu cuenta</h1>
        <p className="auth-subtitle">Ingresá el código generado por tu app de autenticación</p>

        {qrData && isNewUser && (
          <>
            <p className="auth-subtitle">Escaneá este QR con tu app de autenticación:</p>
            <img src={qrData.qrCode} alt="QR" className="qr-img" />
            <p className="auth-code">{qrData.manualCode}</p>
          </>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Código TOTP"
            className="auth-input"
            required
          />
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>

        <p className="auth-p-end">
          <button onClick={handleLogout} className="auth-link">Cerrar sesión</button>
        </p>
      </div>
    </div>
  );
};

export default VerifyAccount;