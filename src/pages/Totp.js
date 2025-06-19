import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const Totp = () => {
  const [codigo, setCodigo] = useState('');
  const navigate = useNavigate();

  const handleVerify = async () => {
    try {
      const username = sessionStorage.getItem('username');

      const response = await axios.post('https://raulocoin.onrender.com/api/verify-totp', {
        username,
        totpToken: codigo,
      });

      const res = response.data;

      if (res.success) {
        sessionStorage.setItem('balance', res.user.balance);
        sessionStorage.setItem('name', res.user.name);

        navigate('/account', {
          state: {
            username: res.user.username,
            name: res.user.name,
          },
        });
      } else {
        message.error('Código inválido');
      }
    } catch (error) {
      console.error(error);
      message.error('Error al verificar el código');
    }
  };

  return (
    <div className="card">
      <h2 className="title">Verificación TOTP</h2>
      <Input
        className="input"
        placeholder="Código TOTP"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />
      <Button className="button" onClick={handleVerify}>
        Verificar
      </Button>
    </div>
  );
};

export default Totp;
