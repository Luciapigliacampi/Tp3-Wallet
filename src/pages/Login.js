import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const { loginWithRedirect, user, isAuthenticated, isLoading, getIdTokenClaims, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const autenticarConBackend = async () => {
      try {
        const idToken = await getIdTokenClaims();
        const accessToken = await getAccessTokenSilently();

        const payload = {
          auth0_payload: idToken.__raw ? JSON.parse(atob(idToken.__raw.split('.')[1])) : user,
          auth0_tokens: {
            id_token: idToken.__raw,
            access_token: accessToken,
            token_type: "Bearer",
            scope: "openid profile email"
          }
        };

        const response = await axios.post("https://raulocoin.onrender.com/api/auth0/authenticate", payload);
        const res = response.data;

        if (res.success && res.user) {
          sessionStorage.setItem('email', res.user.email);
          sessionStorage.setItem('username', res.user.username);
          sessionStorage.setItem('name', res.user.name);
          sessionStorage.setItem('balance', res.user.balance);

          if (res.needsTotpSetup) {
            // Usuario nuevo o TOTP pendiente de configuración
            navigate('/verify-account', {
              state: {
                username: res.user.username,
                qrData: res.totpSetup,
                isNewUser: res.existingUser === false
              }
            });
          } else if (!res.user.totpVerified) {
            // Usuario existente pero no ha verificado el código aún
            navigate('/verify-account', {
              state: {
                alias: res.user.username,
                isNewUser: false
              }
            });
          } else {
            navigate('/account', {
              state: {
                name: res.user.name,
                username: res.user.username,
                balance: res.user.balance,
              },
            });
          }
        } else {
          alert("No se pudo autenticar el usuario");
        }

      } catch (error) {
        console.error('Error al autenticar con el backend:', error);
        alert("Error al conectar con el servidor");
      }
    };

    if (isAuthenticated && user) {
      autenticarConBackend();
    }
  }, [isAuthenticated, user, getIdTokenClaims, getAccessTokenSilently, navigate]);

  if (isLoading) return <Spin tip="Cargando..." />;

  return (
    <div className="login-container">
      <img src="/assets/9coE.gif" alt="logo" className="logo-img" />
      <h1 className="auth-title">Iniciar sesión</h1>
      <p className="auth-subtitle">¡Bienvenido de nuevo, te hemos echado de menos!</p>

      <Button type="primary" className="auth-button" onClick={() => loginWithRedirect()}>
        Iniciar sesión con Auth0
      </Button>

      <Button
        type="default"
        className="auth-button"
        style={{ marginTop: '1rem' }}
        onClick={() => navigate('/RecoverTotp')}
      >
        Recuperar TOTP
      </Button>
    </div>
  );
};

export default Login;
