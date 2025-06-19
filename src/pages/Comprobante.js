import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Comprobante = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fromUser, toUser, transaction } = location.state || {};

  if (!fromUser || !toUser || !transaction) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="auth-title">Comprobante no disponible</h1>
          <p className="auth-subtitle">Faltan datos para mostrar la transferencia.</p>
          <button className="auth-button" onClick={() => navigate('/account')}>
            Volver a mi cuenta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="auth-title">Comprobante de Transferencia</h1>
        <div className="history-container">
          <table className="history-table">
            <tbody>
              <tr>
                <th>Emisor</th>
                <td>{fromUser.username}</td>
              </tr>
              <tr>
                <th>Receptor</th>
                <td>{toUser.username}</td>
              </tr>
              <tr>
                <th>Monto</th>
                <td>{transaction.amount}</td>
              </tr>
              <tr>
                <th>Fecha</th>
                <td>{new Date(transaction.date).toLocaleString()}</td>
              </tr>
              <tr>
                <th>ID de operación</th>
                <td>{transaction.id}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button className="auth-button" onClick={() => navigate('/account')}>
          Volver a mi cuenta
        </button>
      </div>
    </div>
  );
};

export default Comprobante;