import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, message } from 'antd';
import axios from 'axios';

const Login = () => {
  const [alias, setAlias] = useState('');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('https://raulocoin.onrender.com/api/verify-totp', {
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
        message.error(res.message || 'Código incorrecto');
      }
    } catch (error) {
      console.error(error);
      message.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <img src="/assets/raulCoin.png" alt="raulCoin" className="logo-img" />
        <h1 className="auth-title">Iniciar sesión</h1>
        <p className="auth-subtitle">Ingresá tu alias y el código TOTP</p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            required
            className="auth-input"
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
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="auth-p-end">
            <Link to="/register" className="auth-link">¿No tenés cuenta? Registrate</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;