import React, { useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Input, Button, message } from 'antd';

const VerifyAccount = () => {
  const location = useLocation();
  const [alias, setAlias] = useState(location.state?.alias || location.state?.username || '');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { logout } = useAuth0();

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

        // Guardar datos en sessionStorage
        sessionStorage.setItem('username', user.username);
        sessionStorage.setItem('name', user.name);
        sessionStorage.setItem('email', user.email);
        sessionStorage.setItem('balance', user.balance);

        navigate('/account', {
          state: {
            username: user.username,
            name: user.name,
          },
        });
      } else {
        message.error(res.message || 'Código inválido');
      }
    } catch (error) {
      console.error('Error al verificar TOTP:', error);
      message.error('Error del servidor');
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <h2 className="title">Verificar Código</h2>

      <p>Alias:</p>
      <Input
        className="input"
        placeholder="Alias"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        disabled
      />

      <p>Ingresá tu código TOTP:</p>
      <Input
        className="input"
        placeholder="Código TOTP"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />

      <Button
        className="button"
        type="primary"
        onClick={handleSubmit}
        loading={loading}
        block
      >
        Verificar
      </Button>

      <Button
        danger
        type="text"
        style={{ marginTop: '1rem' }}
        onClick={handleLogout}
      >
        Cerrar sesión
      </Button>

      <Link to="/recover" className="link">
        ¿Perdiste tu código?
      </Link>
    </div>
  );
};

export default VerifyAccount;
