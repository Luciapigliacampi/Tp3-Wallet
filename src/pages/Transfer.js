import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Transfer = () => {
  const navigate = useNavigate();

  const fromUsername = sessionStorage.getItem('username');
  const [toAlias, setToAlias] = useState('');
  const [amount, setAmount] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!toAlias) return;

    try {
      const res = await axios.get(`https://raulocoin.onrender.com/api/search-users?alias=${toAlias}`);
      setSearchResults(res.data.results || []);
    } catch (err) {
      console.error('Error al buscar usuarios:', err);
    }
  };

  const handleTransfer = async () => {
    if (!fromUsername || !amount || !codigo || !toAlias) {
      alert('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const verifyRes = await axios.post('https://raulocoin.onrender.com/api/verify-totp', {
        username: fromUsername,
        totpToken: codigo,
      });

      if (!verifyRes.data.success) {
        alert('Código TOTP inválido');
        setLoading(false);
        return;
      }

      const token = verifyRes.data.token;

      const transferRes = await axios.post('https://raulocoin.onrender.com/api/transfer', {
        fromUsername,
        toAlias,
        amount: parseFloat(amount),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = transferRes.data;

      if (result.success) {
        sessionStorage.setItem('lastTransfer', JSON.stringify(result));
        navigate('/comprobante');
      } else {
        alert(result.message || 'Error al transferir');
      }
    } catch (err) {
      console.error('Error en la transferencia:', err);
      alert('Error en la transferencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="auth-title">Transferencia</h1>

        <input
          type="text"
          placeholder="Alias del destinatario"
          value={toAlias}
          onChange={(e) => setToAlias(e.target.value)}
          className="auth-input"
        />
        <button onClick={handleSearch} className="auth-button" style={{ marginBottom: '15px' }}>
          Buscar destinatario
        </button>

        {searchResults.length > 0 && (
          <div className="user-container">
            <strong>Resultado:</strong>
            <ul>
              {searchResults.map((user, index) => (
                <li key={index}>{user.username} - {user.name}</li>
              ))}
            </ul>
          </div>
        )}

        <input
          type="number"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="auth-input"
        />

        <input
          type="text"
          placeholder="Código TOTP"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className="auth-input"
        />

        <button
          onClick={handleTransfer}
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Transferir'}
        </button>

        <p className="auth-p-end">
          <button className="auth-link" onClick={() => navigate('/account')}>Volver</button>
        </p>
      </div>
    </div>
  );
};

export default Transfer;