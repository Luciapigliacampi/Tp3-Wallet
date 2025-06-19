import React, { useState } from 'react';
import { Input, Button, message, AutoComplete } from 'antd';
import jsPDF from 'jspdf';
import { useLocation, useNavigate } from 'react-router-dom';

const Transfer = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [toUsername, setToUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferData, setTransferData] = useState(null);

  const [options, setOptions] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (value) => {
    setToUsername(value);
    if (value.length < 3) {
      setOptions([]);
      return;
    }

    try {
      setSearching(true);
      const res = await fetch(`https://raulocoin.onrender.com/api/search-users?q=${value}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success && data.users.length > 0) {
        setOptions(
          data.users.map((user) => ({
            label: `${user.name} (${user.username})`,
            value: user.username,
          }))
        );
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error(error);
      setOptions([]);
    } finally {
      setSearching(false);
    }
  };

  const handleTransfer = async () => {
    if (!toUsername || !amount || !totpToken) {
      message.error('Completá todos los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('https://raulocoin.onrender.com/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          toUsername,
          amount,
          description,
          totpToken,
        }),
      });

      const data = await res.json();

      if (data.success) {
        message.success('Transferencia realizada correctamente');
        setTransferData(data.transfer);
        navigate('/comprobante', { state: { tx: data.transfer } });
      } else {
        message.error(data.message || 'Error al transferir');
      }
    } catch (error) {
      console.error(error);
      message.error('Error del servidor');
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <h2 className="title">Nueva Transferencia</h2>

      <label>Destinatario:</label>
      <AutoComplete
        className="input"
        options={options}
        onSearch={handleSearch}
        onChange={setToUsername}
        value={toUsername}
        placeholder="Buscar por alias"
        disabled={searching}
      />

      <label>Monto:</label>
      <Input
        className="input"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Monto"
      />

      <label>Descripción:</label>
      <Input
        className="input"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Motivo (opcional)"
      />

      <label>Código TOTP:</label>
      <Input
        className="input"
        value={totpToken}
        onChange={(e) => setTotpToken(e.target.value)}
        placeholder="Código de autenticación"
      />

      <Button
        className="button"
        type="primary"
        loading={loading}
        onClick={handleTransfer}
      >
        Enviar
      </Button>

      <Button
        type="text"
        className="link"
        onClick={() => navigate('/account')}
      >
        Volver a cuenta
      </Button>
    </div>
  );
};

export default Transfer;
