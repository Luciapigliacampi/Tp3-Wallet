import React from 'react';
import { useNavigate } from 'react-router-dom';

const Comprobante = () => {
  const navigate = useNavigate();
  const lastTransfer = JSON.parse(sessionStorage.getItem('lastTransfer'));

  const handleVolver = () => {
    sessionStorage.removeItem('lastTransfer');
    navigate('/account');
  };

  if (!lastTransfer) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="auth-title">Sin comprobante</h1>
          <p className="auth-subtitle">No hay datos de una transferencia reciente.</p>
          <button className="auth-button" onClick={handleVolver}>Volver</button>
        </div>
      </div>
    );
  }

  const { fromUsername, toAlias, amount, timestamp, transactionId } = lastTransfer;

  return (
    <div className="container">
      <div className="card">
        <h1 className="auth-title">Comprobante</h1>
        <p className="auth-subtitle">Tu transferencia fue realizada con éxito</p>

        <div style={{ marginBottom: '15px' }}>
          <p><strong>De:</strong> {fromUsername}</p>
          <p><strong>Para:</strong> {toAlias}</p>
          <p><strong>Monto:</strong> ${parseFloat(amount).toFixed(2)}</p>
          <p><strong>Fecha:</strong> {new Date(timestamp).toLocaleString()}</p>
          <p><strong>ID de transacción:</strong> {transactionId}</p>
        </div>

        <button className="auth-button" onClick={handleVolver}>Volver al inicio</button>
      </div>
    </div>
  );
};

export default Comprobante;