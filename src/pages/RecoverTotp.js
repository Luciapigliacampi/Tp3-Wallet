import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import axios from 'axios';

const RecoverTotp = () => {
  const [email, setEmail] = useState('');
  const [appName, setAppName] = useState('RauloCoins');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!email || !appName) {
      message.warning('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://raulocoin.onrender.com/api/generate-totp?email=${email}&appName=${appName}`
      );

      if (response.data && response.data.token) {
        setToken(response.data.token);
        message.success('Código generado con éxito');
      } else {
        message.error('No se pudo recuperar el código');
      }
    } catch (error) {
      console.error(error);
      message.error('Error al recuperar el TOTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="auth-title">Recuperar TOTP</h1>
        <p className="auth-subtitle">Ingresa tu correo para recuperar tu código</p>

        <input
          className="auth-input"
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="auth-input"
          type="text"
          placeholder="Nombre de la app (por defecto: RauloCoins)"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
        />

        <button
          className="auth-button"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Recuperar código'}
        </button>

        {token && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p className="auth-code" onClick={() => navigator.clipboard.writeText(token)}>
              {token}
            </p>
            <small style={{ fontSize: 13 }}>Haz clic para copiar</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecoverTotp;