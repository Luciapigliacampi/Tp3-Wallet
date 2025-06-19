import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const Transfer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const fromUsername = sessionStorage.getItem('username');
  const [searchTerm, setSearchTerm] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length < 2) return;
      try {
        const response = await axios.get(`https://raulocoin.onrender.com/api/search-users?q=${searchTerm}`);
        setRecipients(response.data.filter(user => user.username !== fromUsername));
      } catch (err) {
        console.error('Error al buscar usuarios:', err);
      }
    };
    searchUsers();
  }, [searchTerm, fromUsername]);

  const handleTotpVerify = async () => {
    try {
      const res = await axios.post('https://raulocoin.onrender.com/api/verify-totp', {
        username: fromUsername,
        totpToken: totpCode,
      });
      setToken(res.data.operationToken);
      return true;
    } catch (err) {
      setError('Código TOTP incorrecto');
      return false;
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');

    const isValid = await handleTotpVerify();
    if (!isValid) return;

    try {
      const response = await axios.post('https://raulocoin.onrender.com/api/transfer', {
        fromUsername,
        toUsername: selectedRecipient,
        amount,
        token,
      });

      const { fromUser, toUser, transaction } = response.data;

      navigate('/comprobante', {
        state: {
          fromUser,
          toUser,
          transaction,
        },
      });
    } catch (err) {
      console.error('Error en la transferencia:', err);
      setError('Error en la transferencia. Intentalo nuevamente.');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="auth-title">Nueva Transferencia</h1>
        <form onSubmit={handleTransfer}>
          <input
            className="auth-input"
            placeholder="Buscar destinatario"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            required
          />
          {recipients.length > 0 && (
            <select
              className="auth-input"
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              required
            >
              <option value="">Seleccionar destinatario</option>
              {recipients.map((r) => (
                <option key={r.username} value={r.username}>
                  {r.username}
                </option>
              ))}
            </select>
          )}

          <input
            className="auth-input"
            type="number"
            placeholder="Monto"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <input
            className="auth-input"
            type="text"
            placeholder="Código TOTP"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            required
          />

          {error && <p className="auth-subtitle">{error}</p>}

          <button type="submit" className="auth-button">
            Transferir
          </button>
        </form>
      </div>
    </div>
  );
};

export default Transfer;