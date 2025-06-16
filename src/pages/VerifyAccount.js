import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Input, Button } from 'antd';

const VerifyAccount = () => {
  const location = useLocation();
  const [alias, setAlias] = useState(location.state?.alias || '');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        sessionStorage.setItem('balance', user.balance);
        sessionStorage.setItem('token', res.token);

        // Redirigir a cuenta
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

  return (
    <div className="login-container">
      <img src="/assets/raulCoin.png" alt="raulCoin" className="logo-img" />
      <h1 className="auth-title">Verifica tu cuenta</h1>
      <p className="auth-subtitle">¡Es necesario verificar para continuar!</p>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Alias"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          required
          className="auth-input"
          disabled={!!location.state?.alias}
        />

        <Input
          type="text"
          placeholder="Código TOTP"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
          className="auth-input"
        />

        <Button type="primary" htmlType="submit" className="auth-button" disabled={loading}>
          {loading ? 'Cargando...' : 'Verificar'}
        </Button>

                {/* Botón para recuperar TOTP */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/RecoverTotp">
            <Button type="default">Recuperar TOTP</Button>
          </Link>
        </div>

        <p className="auth-p-end">
          <Link className="auth-link" to="/">Volver</Link>
        </p>


      </form>
    </div>
  );
};

export default VerifyAccount;
