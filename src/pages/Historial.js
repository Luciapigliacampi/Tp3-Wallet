import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { List, Button, message, DatePicker, Input, Space, Select } from 'antd';
import { useAuth0 } from '@auth0/auth0-react';
import dayjs from 'dayjs';
import { DownloadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Historial = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, username } = location.state || {};

  const { user, getAccessTokenSilently } = useAuth0();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [aliasFilter, setAliasFilter] = useState('');
  const [transactionType, setTransactionType] = useState('todos');
  const [loading, setLoading] = useState(true);

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
        const sinEdiciones = data.transactions.filter(
          (tx) => !tx.description?.toLowerCase().includes('perfil')
        );
        setTransactions(sinEdiciones);
        setFilteredTransactions(sinEdiciones);
      } else {
        message.error(data.message || 'Error al obtener transacciones');
      }
    } catch (error) {
      console.error(error);
      message.error('Error de red al obtener transacciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const applyFilters = (range, alias, type) => {
    let filtered = [...transactions];

    if (range && range.length === 2) {
      const [start, end] = range;
      filtered = filtered.filter((tx) => {
        const txDate = dayjs.unix(tx.createdAt);
        return txDate.isAfter(start.startOf('day').subtract(1, 'second')) &&
               txDate.isBefore(end.endOf('day').add(1, 'second'));
      });
    }

    if (alias && alias.trim().length > 0) {
      const aliasLower = alias.trim().toLowerCase();
      filtered = filtered.filter((tx) => {
        const fields = [tx.toName, tx.fromName, tx.awardedBy];
        return fields.some(field => field?.toLowerCase().includes(aliasLower));
      });
    }

    if (type !== 'todos') {
      filtered = filtered.filter((tx) => {
        const isIncoming = tx.toUsername === username;
        return (type === 'entrantes' && isIncoming) || (type === 'salientes' && !isIncoming);
      });
    }

    setFilteredTransactions(filtered);
  };

  useEffect(() => {
    applyFilters(dateRange, aliasFilter, transactionType);
  }, [transactions, dateRange, aliasFilter, transactionType]);

  const renderItem = (item) => (
    <List.Item style={{ whiteSpace: 'pre-line' }}>
      <div>
        <p><strong>De:</strong> {item.fromName} (@{item.fromUsername})</p>
        <p><strong>Para:</strong> {item.toName} (@{item.toUsername})</p>
        <p><strong>Monto:</strong> {item.amount} Raulocoins</p>
        <p><strong>Descripción:</strong> {item.description || '-'}</p>
        <p><strong>Fecha:</strong> {dayjs.unix(item.createdAt).format('DD/MM/YYYY HH:mm')}</p>
        <Button
          className="button"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => navigate('/comprobante', { state: { tx: item } })}
        >
          Ver comprobante
        </Button>
      </div>
    </List.Item>
  );

  return (
    <div className="card">
      <h2 className="title">Historial de transacciones</h2>

      <Space direction="vertical" style={{ width: '100%' }}>
        <RangePicker
          style={{ width: '100%' }}
          onChange={(range) => setDateRange(range)}
          value={dateRange}
        />

        <Input
          className="input"
          placeholder="Filtrar por alias"
          value={aliasFilter}
          onChange={(e) => setAliasFilter(e.target.value)}
        />

        <Select
          className="input"
          value={transactionType}
          onChange={setTransactionType}
        >
          <Option value="todos">Todos</Option>
          <Option value="entrantes">Entrantes</Option>
          <Option value="salientes">Salientes</Option>
        </Select>
      </Space>

      <div className="scrollable" style={{ marginTop: '1rem' }}>
        <List
          loading={loading}
          dataSource={filteredTransactions}
          renderItem={renderItem}
        />
      </div>

      <Button className="button" style={{ marginTop: '1rem' }} onClick={() => navigate('/account')}>
        Volver a cuenta
      </Button>
    </div>
  );
};

export default Historial;
