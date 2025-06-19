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
    if (!toUsername || !amount || !description || !totpToken) {
      return message.error('Por favor completa todos los campos');
    }

    setLoading(true);

    const transferPayload = {
      fromUsername: state?.username,
      toUsername,
      amount: parseFloat(amount),
      description,
      operationToken: Math.random().toString(36).substring(2, 12),
      totpToken,
    };

    try {
      const transferRes = await fetch('https://raulocoin.onrender.com/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(transferPayload),
      });

      const transferData = await transferRes.json();

      if (!transferData.success) {
        message.error(transferData.message || 'Error al realizar la transferencia');
        return;
      }

      const balanceRes = await fetch('https://raulocoin.onrender.com/api/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: state?.username, totpToken }),
      });

      const balanceData = await balanceRes.json();

      if (!balanceData.success) {
        message.warning('Transferencia exitosa, pero no se pudo actualizar el saldo.');
      }

      setTransferData(transferData.transfer);
      message.success('Transferencia realizada con éxito');
    } catch (error) {
      console.error(error);
      message.error('Error al realizar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  const generarPDF = () => {
    if (!transferData) return;

    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('COMPROBANTE DE TRANSFERENCIA', 105, 20, null, null, 'center');

    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    doc.setFillColor(245, 245, 245);
    doc.rect(20, 30, 170, 80, 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    let y = 40;

    doc.text(` De: ${transferData.from.name} (${transferData.from.username})`, 25, y);
    y += 10;
    doc.text(` Para: ${transferData.to.name} (${transferData.to.username})`, 25, y);
    y += 10;
    doc.text(` Monto: ${transferData.amount} Raulocoins`, 25, y);
    y += 10;
    doc.text(` Descripción: ${transferData.description || '-'}`, 25, y);
    y += 10;
    doc.text(` Fecha: ${new Date(transferData.timestamp * 1000).toLocaleString()}`, 25, y);

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Gracias por usar Raulocoin ', 105, 130, null, null, 'center');

    doc.save('comprobante-transferencia.pdf');
  };

  return (
    <div className="login-container">
      <Button
        type="primary"
        className="auth-button"
        onClick={() => navigate(-1)}
        style={{ width: 'auto', padding: '0 16px', marginBottom: 20 }}
      >
        ← Volver
      </Button>

      <h2 className="auth-title">Transferir Raulocoins</h2>

      <AutoComplete
        className="auth-input"
        style={{ width: '100%' }}
        options={options}
        value={toUsername}
        onSearch={handleSearch}
        onChange={(value) => setToUsername(value)}
        placeholder="Usuario destino (alias)"
        allowClear
        loading={searching}
        disabled={!!transferData}
      />

      <Input
        className="auth-input"
        placeholder="Monto"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={!!transferData}
      />
      <Input
        className="auth-input"
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={!!transferData}
      />
      <Input
        className="auth-input"
        placeholder="Código TOTP"
        value={totpToken}
        onChange={(e) => setTotpToken(e.target.value)}
        disabled={!!transferData}
      />
      <Button
        type="primary"
        className="auth-button"
        onClick={handleTransfer}
        loading={loading}
        disabled={!!transferData}
      >
        Transferir
      </Button>

      {transferData && (
        <div className="user-container" style={{ marginTop: 30 }}>
          <h3 className="saludo">✅ Comprobante de Transferencia</h3>
          <p className="saludo"><strong>De:</strong> {transferData.from.name} ({transferData.from.username})</p>
          <p className="saludo"><strong>Para:</strong> {transferData.to.name} ({transferData.to.username})</p>
          <p className="saludo"><strong>Monto:</strong> {transferData.amount} Raulocoins</p>
          <p className="saludo"><strong>Descripción:</strong> {transferData.description}</p>
          <p className="saludo"><strong>Fecha:</strong> {new Date(transferData.timestamp * 1000).toLocaleString()}</p>

          <Button
            type="primary"
            className="auth-button"
            onClick={generarPDF}
            style={{ marginTop: 15 }}
          >
            Descargar comprobante
          </Button>
        </div>
      )}
    </div>
  );
};

export default Transfer;
