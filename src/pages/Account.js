import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, List, message, Input } from 'antd';
import { LogoutOutlined, DownloadOutlined } from '@ant-design/icons';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const Account = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, getAccessTokenSilently, isAuthenticated, logout } = useAuth0();

  const storedUsername = sessionStorage.getItem('username');
  const storedName = sessionStorage.getItem('name');
  const { name: navName, username: navUsername } = location.state || {};

  const name = navName || storedName || user?.name;
  const username = navUsername || storedUsername || user?.nickname || user?.email;

  const [transactions, setTransactions] = useState([]);
  const [totpToken, setTotpToken] = useState(sessionStorage.getItem('totpToken') || '');
  const [needsTotp, setNeedsTotp] = useState(false);
  const [inputTotp, setInputTotp] = useState('');
  const [updatedBalance, setUpdatedBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const fetchTransactions = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const accessToken = await getAccessTokenSilently();
      const response = await fetch('https://raulocoin.onrender.com/api/auth0/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const filtered = data.transactions.filter(
          (tx) => !tx.description?.toLowerCase().includes('perfil')
        );
        setTransactions(filtered);
        setNeedsTotp(false);
        sessionStorage.setItem('totpToken', '');
        setTotpToken('');
      } else {
        message.error(data.message || 'Error al obtener transacciones');
      }
    } catch (error) {
      message.error('Error de red al obtener transacciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch('https://raulocoin.onrender.com/api/auth0/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (data.success) {
        setUpdatedBalance(data.user.balance);
      }
    } catch (err) {
      message.error('Error de red al obtener saldo');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await axios.post('https://raulocoin.onrender.com/api/auth0/balance', {
        email: user.email,
      });
      const { user: userData } = res.data;
      if (userData) {
        setUpdatedBalance(userData.balance);
        sessionStorage.setItem('username', userData.username);
        sessionStorage.setItem('name', userData.name);
      }
    } catch (err) {
      console.error('Error al refrescar datos del perfil:', err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (!isAuthenticated || !user) return;
      const storedToken = sessionStorage.getItem('totpToken');
      if (storedToken) {
        setTotpToken(storedToken);
        setNeedsTotp(false);
        await Promise.all([fetchBalance(), fetchTransactions()]);
      } else {
        try {
          const accessToken = await getAccessTokenSilently();
          const response = await axios.post('https://raulocoin.onrender.com/api/auth0/authenticate', {
            auth0_payload: user,
            auth0_tokens: {
              access_token: accessToken,
            },
          });

          if (response.data.success) {
            const { needsTotpSetup } = response.data;
            if (needsTotpSetup) {
              setNeedsTotp(true);
            } else {
              setNeedsTotp(false);
              await Promise.all([fetchBalance(), fetchTransactions()]);
            }
          } else {
            message.error(response.data.message || 'No se pudo verificar el estado de TOTP');
            setNeedsTotp(true);
          }
        } catch (err) {
          message.error('Error al verificar estado de la cuenta');
          setNeedsTotp(true);
        }
      }
      setInitializing(false);
    };

    initialize();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const refresh = async () => {
      setInitializing(true);
      await fetchUserProfile();
      await fetchBalance();
      await fetchTransactions();
      setInitializing(false);
    };

    if (isAuthenticated && user?.email) {
      refresh();
    }
  }, [location.key]);

  const handleLogout = () => {
    sessionStorage.removeItem('totpToken');
    logout({ returnTo: window.location.origin });
  };

  if (initializing) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h2>Cargando cuenta...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="icon-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user?.picture && (
            <img
              src={user.picture}
              alt="Foto de perfil"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #ddd',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/profile')}
              title="Ir al perfil"
            />
          )}
          <p className="saludo">Hola, {name}</p>
        </div>
        <LogoutOutlined className="logout-icon" onClick={handleLogout} />
      </div>

      <div className="card user-container" style={{ marginTop: 20 }}>
        <p className="saludo">Saldo actual</p>
        <h1 className="saldo">R$ {updatedBalance?.toLocaleString()}</h1>
        <p className="saludo">{username}</p>
      </div>

      <Button
        type="primary"
        className="auth-button"
        onClick={() =>
          navigate('/transfer', {
            state: { name, username, totpToken },
          })
        }
      >
        Transferir
      </Button>

      {needsTotp ? (
        <div className="card" style={{ marginTop: 30, textAlign: 'center' }}>
          <h3>Sesión expirada</h3>
          <p>Tu sesión ha caducado. Por favor, inicia sesión nuevamente para continuar.</p>
          <Button
            type="primary"
            onClick={() => {
              sessionStorage.clear();
              navigate('/');
            }}
          >
            Ir al inicio
          </Button>
        </div>
      ) : (
        <div className="card" style={{ marginTop: 30 }}>
          <h2>Historial de Transferencias</h2>
          {loading ? (
            <p>Cargando transacciones...</p>
          ) : transactions.length > 0 ? (
            <>
              <Button
                type="link"
                style={{ marginBottom: 10 }}
                onClick={() =>
                  navigate('/historial', { state: { transactions, name, username } })
                }
              >
                Ver todas las transferencias
              </Button>
              <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 10 }}>
                <List
                  bordered
                  dataSource={transactions.slice(0, 3)}
                  renderItem={(tx) => {
                    const isSent = tx.type === 'sent';
                    const counterpart = isSent
                      ? tx.toName || 'Desconocido'
                      : tx.fromName || tx.awardedBy || 'Sistema';

                    return (
                      <List.Item style={{ position: 'relative', paddingTop: 30 }}>
                        <Button
                          type="text"
                          icon={<DownloadOutlined style={{ fontSize: 20, color: 'black' }} />}
                          onClick={() => navigate('/comprobante', { state: { tx } })}
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            padding: '6px 12px',
                          }}
                        />
                        <div style={{ width: '100%' }}>
                          <p><strong>{isSent ? 'Enviado a' : 'Recibido de'}:</strong> {counterpart}</p>
                          <p><strong>Monto:</strong> {tx.amount > 0 ? '+' : ''}{tx.amount}</p>
                          <p><strong>Descripción:</strong> {tx.description}</p>
                          <p><strong>Fecha:</strong> {new Date(tx.createdAt * 1000).toLocaleString()}</p>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </div>
            </>
          ) : (
            <p>No hay transacciones para mostrar.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Account;
