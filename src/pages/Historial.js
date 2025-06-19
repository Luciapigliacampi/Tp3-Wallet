import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Historial = () => {
  const [transactions, setTransactions] = useState([]);
  const username = sessionStorage.getItem('username');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`https://raulocoin.onrender.com/api/history/${username}`);
        setTransactions(response.data || []);
      } catch (error) {
        console.error('Error al obtener historial:', error);
      }
    };

    if (username) {
      fetchTransactions();
    }
  }, [username]);

  return (
    <div className="container">
      <div className="card">
        <h1 className="auth-title">Historial de transferencias</h1>
        <div className="transferencias-container">
          <div className="history-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Emisor</th>
                  <th>Receptor</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index}>
                    <td>{tx.fromUsername}</td>
                    <td>{tx.toUsername}</td>
                    <td>{tx.amount}</td>
                    <td>{new Date(tx.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <p className="auth-subtitle" style={{ marginTop: '20px' }}>
                No se encontraron transferencias.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Historial;
