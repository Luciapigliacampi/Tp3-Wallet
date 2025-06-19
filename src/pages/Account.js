import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const Account = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth0();

  const storedUsername = sessionStorage.getItem('username');
  const storedName = sessionStorage.getItem('name');
  const storedBalance = sessionStorage.getItem('balance');
  const token = sessionStorage.getItem('token');

  const [transactions, setTransactions] = useState([]);

  const name = location.state?.name || storedName || '';
  const username = location.state?.username || storedUsername || '';
  const balance = location.state?.balance || storedBalance || '';

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`https://raulocoin.onrender.com/api/transactions/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTransactions(res.data.transactions || []);
      } catch (err) {
        console.error('Error al obtener el historial:', err);
      }
    };

    fetchTransactions();
  }, [username, token]);

  const handleLogout = () => {
    sessionStorage.clear();
    logout({ returnTo: window.location.origin });
  };

  return (
    <div className="container">
      <div className="card">
        <div className="icon-container">
          <div>
            <p className="saludo">Hola, <strong>{name}</strong></p>
            <p className="saldo">Saldo: ${parseFloat(balance).toFixed(2)}</p>
          </div>
          <LogoutOutlined className="logout-icon" onClick={handleLogout} />
        </div>

        <button
          className="auth-button"
          onClick={() => navigate('/transfer')}
          style={{ marginBottom: '20px' }}
        >
          Nueva Transferencia
        </button>

        <div className="transferencias-container">
          <h2>Historial de transferencias</h2>
          {transactions.length === 0 ? (
            <p className="auth-subtitle">No hay transferencias aún.</p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Para</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index}>
                    <td>{new Date(tx.timestamp).toLocaleString()}</td>
                    <td>${parseFloat(tx.amount).toFixed(2)}</td>
                    <td>{tx.toAlias}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;