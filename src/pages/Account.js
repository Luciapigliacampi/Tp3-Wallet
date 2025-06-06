import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, List, message, Input } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

const Account = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, username } = location.state || {};

  const [transactions, setTransactions] = useState([]);
  const [totpToken, setTotpToken] = useState(sessionStorage.getItem('totpToken') || '');
  const [needsTotp, setNeedsTotp] = useState(!sessionStorage.getItem('totpToken'));
  const [inputTotp, setInputTotp] = useState('');
  const [updatedBalance, setUpdatedBalance] = useState(0);

  const fetchTransactions = async (token) => {
    try {
      const res = await fetch('https://raulocoin.onrender.com/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, totpToken: token })
      });

      const data = await res.json();

      if (!data.success) {
        setNeedsTotp(true);
        sessionStorage.removeItem('totpToken');
        return;
      }

      setTransactions(data.transactions);
      sessionStorage.setItem('totpToken', token);
      setTotpToken(token);
      setNeedsTotp(false);
    } catch (err) {
      message.error('Error de red al obtener transacciones');
    }
  };

  const fetchBalance = async (token) => {
    try {
      const res = await fetch('https://raulocoin.onrender.com/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, totpToken: token })
      });

      const data = await res.json();

      if (data.success) {
        setUpdatedBalance(data.user.balance);
      } else {
        console.warn('No se pudo actualizar el saldo:', data.message);
      }
    } catch (err) {
      message.error('Error de red al obtener saldo');
    }
  };

  useEffect(() => {
    if (username && totpToken) {
      fetchTransactions(totpToken);
      fetchBalance(totpToken);
    }
  }, [username, totpToken]);

  const handleTotpSubmit = () => {
    if (!inputTotp.trim()) {
      message.error('Ingresá el código TOTP');
      return;
    }

    const token = inputTotp.trim();
    fetchTransactions(token);
    fetchBalance(token);
    setInputTotp('');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('totpToken');
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className='icon-container'>
        <p className='saludo'>Hola, {name}</p>
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
          <List
            style={{ marginTop: 20 }}
            header={<strong>Historial de Transacciones</strong>}
            bordered
            dataSource={transactions}
            renderItem={(tx) => {
              const isSent = tx.type === 'sent';
              const counterpart = isSent
                ? tx.toName || 'Desconocido'
                : tx.fromName || tx.awardedBy || 'Sistema';

              return (
                <List.Item>
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
      )}
    </div>
  );
};

export default Account;


