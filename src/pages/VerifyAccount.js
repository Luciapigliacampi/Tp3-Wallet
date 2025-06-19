import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const VerifyAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const username = location.state?.username || location.state?.alias || '';
  const qrData = location.state?.qrData;
  const isNewUser = location.state?.isNewUser === true;

  const [alias, setAlias] = useState(username);
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);

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
        sessionStorage.setItem('token', res.token);

        navigate('/account', {
          state: {
            name: user.name,
            username: user.username,
            balance: user.balance,
          },
        });
      } else {
        alert(res.message || 'Código TOTP incorrecto.');
      }
    } catch (error) {
      console.error('Error al verificar el código TOTP:', error);
      alert('Error al verificar el código TOTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="container">
      <div className="card">
        <img src="/assets/raulCoin.png" alt="raulCoin" className="logo-img" />
        <h1 className="auth-title">Verifica tu cuenta</h1>

        {isNewUser && (
          <>
            <p className="auth-subtitle">
              Tu alias generado es: <strong>{username}</strong>
              <br /> Guardalo para futuras transferencias.
            </p>

            {qrData && (
              <>
                <p className="auth-subtitle">Escaneá este código QR o ingresá el código manual:</p>
                <img src={qrData.qrCodeUrl} alt="QR TOTP" className="qr-img" />
                <p className="auth-code">{qrData.manualSetupCode}</p>
                <p className="auth-subtitle">{qrData.instructions}</p>
              </>
            )}
          </>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            required
            className="auth-input"
            disabled
          />

          <input
            type="text"
            placeholder="Código TOTP"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
            className="auth-input"
          />

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/RecoverTotp" className="auth-link">Recuperar TOTP</Link>
          </div>

          <p className="auth-p-end">
            <button onClick={handleGoBack} className="auth-link" type="button">
              Volver
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccount;