import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Input, Button, message } from 'antd';

const RecoverTotp = () => {
  const navigate = useNavigate();
  const [dato, setDato] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRecover = async () => {
    if (!dato) {
      message.error('Por favor ingresá tu alias o email');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('https://raulocoin.onrender.com/api/recover-totp', {
        aliasOrEmail: dato,
      });

      const res = response.data;

      if (res.success) {
        message.success('Código recuperado con éxito');

        navigate('/verify-account', {
          state: {
            alias: res.user.username,
            isNewUser: false,
          },
        });
      } else {
        message.error(res.message || 'No se pudo recuperar el código');
      }
    } catch (error) {
      console.error('Error al recuperar TOTP:', error);
      message.error('Error del servidor');
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <h2 className="title">Recuperar TOTP</h2>

      <p>Ingresá tu alias o correo electrónico para recuperar tu autenticación:</p>
      <Input
        className="input"
        placeholder="Alias o Email"
        value={dato}
        onChange={(e) => setDato(e.target.value)}
      />

      <Button
        className="button"
        onClick={handleRecover}
        loading={loading}
        block
      >
        Recuperar código
      </Button>

      <a href="/" className="link">
        Volver al inicio
      </a>
    </div>
  );
};

export default RecoverTotp;
