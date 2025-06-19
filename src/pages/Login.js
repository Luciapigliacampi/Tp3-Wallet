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
            // Usuario con TOTP verificado correctamente
            navigate('/account', {
              state: {
                username: res.user.username,
                name: res.user.name
              }
            });
          }
        } else {
          console.error("Error en la autenticación");
        }
      } catch (error) {
        console.error("Error en login Auth0:", error);
      }
    };

    if (isAuthenticated && user) {
      autenticarConBackend();
    }
  }, [isAuthenticated, user, navigate, getAccessTokenSilently, getIdTokenClaims]);

  if (isLoading) {
    return (
      <div className="card">
        <Spin />
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="title">Iniciar sesión</h2>
      <Button className="button" onClick={() => loginWithRedirect()}>
        Iniciar sesión con Auth0
      </Button>
      <a href="/recover" className="link">
        ¿Perdiste tu código de TOTP?
      </a>
    </div>
  );
};

export default Login;
