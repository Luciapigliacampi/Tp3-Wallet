import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [alias, setAlias] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      name: nombre,
      username: alias,
      email: email,
    };

    try {
      const response = await axios.post('https://raulocoin.onrender.com/api/register', data);
      const res = response.data;

      if (res.success) {
        navigate('/totp', { state: res.totpSetup });
      } else {
        message.error(res.message || 'Error al registrarse');
      }
    } catch (error) {
      console.error(error);
      message.error('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <img src="/assets/raulCoin.png" alt="raulCoin" className="logo-img" />
        <h1 className="auth-title">Regístrate</h1>
        <p className="auth-subtitle">¡Empecemos esta aventura juntos!</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="text"
            placeholder="Alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            required
            className="auth-input"
          />

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Registrarme'}
          </button>

          <p className="auth-p-end">
            <Link className="auth-link" to="/">
              Iniciar sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;