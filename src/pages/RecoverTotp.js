import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RecoverTotp = () => {
  const [alias, setAlias] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRecover = async (e) => {
    e.preventDefault();
    setError('');
    setData(null);

    try {
      const response = await axios.get(`https://raulocoin.onrender.com/api/recover-totp/${alias}`);
      if (response.data.qrCode && response.data.manualCode) {
        setData(response.data);
      } else {
        setError('No se pudo recuperar el TOTP.');
      }
    } catch (err) {
      console.error('Error al recuperar TOTP:', err);
      setError('Alias no encontrado o error del servidor');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="auth-title">Recuperar TOTP</h1>
        <p className="auth-subtitle">Ingresá tu alias para recuperar tu clave TOTP</p>

        <form onSubmit={handleRecover}>
          <input
            type="text"
            placeholder="Alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className="auth-input"
            required
          />
          <button type="submit" className="auth-button">Recuperar</button>
        </form>

        {error && <p className="auth-subtitle">{error}</p>}

        {data && (
          <>
            <img src={data.qrCode} alt="QR" className="qr-img" />
            <p className="auth-code">{data.manualCode}</p>
            <button className="auth-button" onClick={() => navigate('/')}>
              Volver al inicio
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RecoverTotp;