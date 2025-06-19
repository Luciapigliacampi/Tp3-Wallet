import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const {
    loginWithRedirect,
    isAuthenticated,
    user,
    isLoading,
  } = useAuth0();

  const navigate = useNavigate();

  useEffect(() => {
    const loginOrRegister = async () => {
      if (!isAuthenticated || !user) return;

      try {
        // Paso 1: registrar o loguear al usuario en el backend
        const res = await axios.post('https://raulocoin.onrender.com/api/register', {
          email: user.email,
          name: user.name,
        });

        const { user: backendUser, totpSetup } = res.data;

        // Guardar en sessionStorage
        sessionStorage.setItem('username', backendUser.username);
        sessionStorage.setItem('name', backendUser.name);
        sessionStorage.setItem('balance', backendUser.balance);

        if (totpSetup) {
          // Usuario nuevo: redirigir a configurar TOTP
          navigate('/verify-account', {
            state: {
              alias: backendUser.username,
              qrData: totpSetup,
              isNewUser: true,
            },
          });
        } else {
          // Usuario existente: redirigir a Account
          navigate('/account', {
            state: {
              name: backendUser.name,
              username: backendUser.username,
              balance: backendUser.balance,
            },
          });
        }
      } catch (err) {
        console.error('Error al registrar o autenticar:', err);
        alert('Error al ingresar. Intentalo nuevamente.');
      }
    };

    loginOrRegister();
  }, [isAuthenticated, user, navigate]);

  if (isLoading) {
    return <div className="container"><div className="card"><p>Cargando...</p></div></div>;
  }

  return (
    <div className="container">
      <div className="card">
        <img src="/assets/raulCoin.png" alt="raulCoin" className="logo-img" />
        <h1 className="auth-title">Bienvenido a RauloCoins</h1>
        <p className="auth-subtitle">Iniciá sesión para comenzar</p>

        <button className="auth-button" onClick={() => loginWithRedirect()}>
          Iniciar sesión con Auth0
        </button>
      </div>
    </div>
  );
};

export default Login;