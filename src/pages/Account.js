import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, List, message, Input } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuth0 } from '@auth0/auth0-react';  // <-- Importa Auth0
import { DownloadOutlined } from '@ant-design/icons';

const Account = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, username } = location.state || {};

  const { user, getAccessTokenSilently, isAuthenticated, logout } = useAuth0(); // <-- Usa Auth0
  console.log('Usuario autenticado:', user);

  const [transactions, setTransactions] = useState([]);
  const [totpToken, setTotpToken] = useState(sessionStorage.getItem('totpToken') || '');
  const [needsTotp, setNeedsTotp] = useState(!sessionStorage.getItem('totpToken'));
  const [inputTotp, setInputTotp] = useState('');
  const [updatedBalance, setUpdatedBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  // NUEVA fetchTransactions con Auth0 y Bearer Token
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
        setNeedsTotp(false); // asumo que con Auth0 no necesitas TOTP
        sessionStorage.setItem('totpToken', ''); // limpio si estaba
        setTotpToken('');
      } else if (response.status === 401 && data.needsRefresh) {
        message.error('Sesión expirada, por favor inicia sesión de nuevo.');
        // podrías hacer logout o refresh aquí si quieres
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
    if (!user?.email) return;  // Asegurarse que user.email exista

    try {
      const res = await fetch('https://raulocoin.onrender.com/api/auth0/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }) // <-- envío email
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
      fetchBalance();  // llamo sin parámetros
    }
  }, [isAuthenticated, user]);


  // Mantengo el handler del TOTP y Logout igual para que funcione la parte de autenticación local
  const handleTotpSubmit = () => {
    if (!inputTotp.trim()) {
      message.error('Ingresá el código TOTP');
      return;
    }

    const token = inputTotp.trim();
    // Aquí podrías llamar a fetchTransactions con token, pero como ahora usamos Auth0, no lo haré
    // Si quieres compatibilidad, podrías hacer:
    // fetchTransactionsConTotp(token);
    fetchBalance(token);
    setInputTotp('');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('totpToken');
    logout({
    returnTo: window.location.origin, // esto redirige a tu página de login o inicio
  });
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
          <p className='saludo'>Hola, {user?.name}</p>
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
              // header={<strong>Historial de Transacciones</strong>}
              bordered
              dataSource={transactions.slice(0, 3)} // <-- solo las primeras 3
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
