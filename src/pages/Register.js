import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const { loginWithRedirect, user, isAuthenticated } = useAuth0();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const alias = user?.nickname || user?.email || '';

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('https://raulocoin.onrender.com/api/register', {
        email: user.email,
        name: user.name,
      });

      const { user: newUser, totpSetup } = response.data;

      sessionStorage.setItem('username', newUser.username);
      sessionStorage.setItem('name', newUser.name);
      sessionStorage.setItem('balance', newUser.balance);

      navigate('/verify-account', {
        state: {
          alias: newUser.username,
          qrData: totpSetup,
          isNewUser: true,
        },
      });
    } catch (error) {
      console.error('Error al registrar:', error);
      alert('Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="auth-title">Crear cuenta</h1>
          <p className="auth-subtitle">Iniciá sesión para registrarte</p>
          <button className="auth-button" onClick={() => loginWithRedirect()}>
            Iniciar sesión con Auth0
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="auth-title">¡Bienvenido!</h1>
        <p className="auth-subtitle">Alias detectado: <strong>{alias}</strong></p>
        <p className="auth-subtitle">Presioná continuar para generar tu clave TOTP</p>

        <form onSubmit={handleRegister}>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Cargando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;