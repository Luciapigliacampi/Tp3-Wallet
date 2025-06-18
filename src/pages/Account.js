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

  // Recupero alias y nombre desde sessionStorage o fallback desde Auth0 o location
  const storedUsername = sessionStorage.getItem('username');
  const storedName = sessionStorage.getItem('name');
  const { name: navName, username: navUsername } = location.state || {};

  const name = navName || storedName || user?.name;
  const username = navUsername || storedUsername || user?.nickname || user?.email;

  const [transactions, setTransactions] = useState([]);
  const [totpToken, setTotpToken] = useState(sessionStorage.getItem('totpToken') || '');
  const [needsTotp, setNeedsTotp] = useState(!sessionStorage.getItem('totpToken'));
  const [inputTotp, setInputTotp] = useState('');
  const [updatedBalance, setUpdatedBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!user?.email) return;
    setLoading(true);

    try {
      const accessToken = await getAccessTokenSilently();

      const response = await fetch('https://raulocoin.onrender.com/api/auth0/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTransactions(data.transactions);
        setNeedsTotp(false);
        sessionStorage.setItem('totpToken', '');
        setTotpToken('');
      } else if (response.status === 401 && data.needsRefresh) {
        message.error('Sesión expirada, por favor inicia sesión de nuevo.');
      } else {
        message.error(data.message || 'Error al obtener transacciones');
      }
    } catch (error) {
      message.error('Error de red al obtener transacciones');
      console.error(error);
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
        body: JSON.stringify({ email: user.email })
      });

      const data = await res.json();

      if (data.success) {
        setUpdatedBalance(data.user.balance);
      } else {
        console.warn('No se pudo actualizar el saldo:', data.message);
      }
    } catch (err) {
      message.error('Error de red al obtener saldo');
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
      fetchBalance();
    }
  }, [isAuthenticated, user]);

  const handleTotpSubmit = async () => {
    if (!inputTotp.trim()) {
      message.error('Ingresá el código TOTP');
      return;
    }

    const token = inputTotp.trim();

    try {
      const res = await axios.post('https://raulocoin.onrender.com/api/verify-totp', {
        username: username, // <-- ahora confiable
        totpToken: token,
      });

      if (res.data.success) {
        sessionStorage.setItem('totpToken', token);
        setTotpToken(token);
        setNeedsTotp(false);
        message.success("Verificación exitosa");

        await fetchBalance();
        await fetchTransactions();
      } else {
        message.error(res.data.message || "Código TOTP incorrecto");
      }
    } catch (err) {
      message.error("Error al verificar código TOTP");
      console.error(err);
    }

    setInputTotp('');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('totpToken');
    logout({ returnTo: window.location.origin });
  };

  return (
    <div className="login-container">
      <div className="icon-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAuthenticated && user?.picture && (
            <img
              src={user.picture}
              alt="Foto de perfil"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer',
                objectFit: 'cover',
                border: '2px solid #ddd'
              }}
              onClick={() => navigate('/profile')}
              title="Ir al perfil"
            />
          )}
          <p className='saludo'>Hola, {name}</p>
        </div>
        <LogoutOutlined className="logout-icon" onClick={handleLogout} />
      </div>

      <div className='user-container'>
        <p className='saludo'>Saldo actual</p>
        <h1 className='saldo'>R$ {updatedBalance?.toLocaleString()}</h1>
        <p className='saludo'>{username}</p>
      </div>

      <Button
        type="primary"
        className='auth-button'
        onClick={() =>
          navigate('/transfer', {
            state: { name, username, totpToken },
          })
        }
      >
        Transferir
      </Button>

      {needsTotp ? (
        <div style={{ marginTop: 30 }}>
          <h3>Debes completar la verificación TOTP para acceder a los detalles del usuario</h3>
          <Input
            placeholder="Código TOTP"
            value={inputTotp}
            onChange={(e) => setInputTotp(e.target.value)}
            style={{ width: 200, marginBottom: 10 }}
          />
          <br />
          <Button type="primary" onClick={handleTotpSubmit}>Verificar</Button>
        </div>
      ) : (
        <div className='history-container'>
          <h2>Historial de Transferencias</h2>

          {loading ? (
            <p>Cargando transacciones...</p>
          ) : transactions.length > 0 ? (
            <List
              style={{ marginTop: 20 }}
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
          ) : (
            <p>No hay transacciones para mostrar.</p>
          )}
          <Button
            type="link"
            style={{ marginTop: 10 }}
            onClick={() => navigate('/historial', { state: { transactions, name, username } })}
          >
            Ver todas las transferencias
          </Button>
        </div>
      )}
    </div>
  );
};

export default Account;
