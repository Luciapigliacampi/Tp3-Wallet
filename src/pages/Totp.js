import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';

const Totp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const totpSetup = location.state;

  if (!totpSetup) {
    message.warning('No hay configuración TOTP. Regístrate primero.');
    navigate('/');
    return null;
  }

  return (
    <div className="container">
      <div className="card">
        <img
          src="/assets/raulCoin.png"
          alt="raulCoin"
          className="logo-img"
        />

        <h1 className="auth-title">Autenticación</h1>
        <p className="auth-subtitle">Escaneá este código QR con tu app de autenticación</p>

        <img
          className="qr-img"
          src={totpSetup.qrCodeUrl}
          alt="Código QR TOTP"
        />

        <p
          className="auth-code"
          onClick={() => navigator.clipboard.writeText(totpSetup.manualSetupCode)}
          title="Haz clic para copiar"
        >
          {totpSetup.manualSetupCode}
        </p>

        <button
          className="auth-button"
          onClick={() => navigate('/')}
        >
          Ingresar
        </button>
      </div>
    </div>
  );
};

export default Totp;