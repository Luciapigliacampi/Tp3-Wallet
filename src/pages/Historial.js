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
                setTransactions(data.transactions);
                setFilteredTransactions(data.transactions); // inicial
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
            filtered = filtered.filter((tx) => tx.type === type);
        }

        setFilteredTransactions(filtered);
    };

    const handleDateChange = (range) => {
        setDateRange(range);
        applyFilters(range, aliasFilter, transactionType);
    };

    const handleAliasChange = (e) => {
        const alias = e.target.value;
        setAliasFilter(alias);
        applyFilters(dateRange, alias, transactionType);
    };

    const handleTypeChange = (value) => {
        setTransactionType(value);
        applyFilters(dateRange, aliasFilter, value);
    };

    const clearFilters = () => {
        setDateRange([]);
        setAliasFilter('');
        setTransactionType('todos');
        setFilteredTransactions(transactions);
    };

    return (
        <div className='login-container'>
            <Button style={{ marginTop: 20 }} onClick={() => navigate(-1)}> ← Volver</Button>
            <h2>Historial Completo de Transferencias</h2>
            <p className='saludo'>Usuario: {name} ({username})</p>

            <Space style={{ marginTop: 20 }} direction="vertical">
                <small style={{ display: 'block', marginBottom: 4, color: '#555' }}>
                    Filtrar por rango de fechas:
                </small>
                <RangePicker
                    onChange={handleDateChange}
                    value={dateRange}
                    format="YYYY-MM-DD"
                />

                <small style={{ display: 'block', marginBottom: 4, color: '#555' }}>
                    Filtrar por alias:
                </small>
                <Input
                    placeholder="Filtrar por alias (nombre o usuario)"
                    value={aliasFilter}
                    onChange={handleAliasChange}
                    allowClear
                />

                <div>
                    <small style={{ display: 'block', marginBottom: 4, color: '#555' }}>
                        Filtrar por categoría:
                    </small>
                    <Select
                        value={transactionType}
                        onChange={handleTypeChange}
                        style={{ width: 200 }}
                    >
                        <Option value="todos">Todos</Option>
                        <Option value="sent">Enviados</Option>
                        <Option value="received">Recibidos</Option>
                    </Select>
                </div>

                <Button onClick={clearFilters}>
                    Limpiar filtros
                </Button>
            </Space>

            {loading ? (
                <p>Cargando transacciones...</p>
            ) : filteredTransactions.length > 0 ? (
                <List
                    style={{ marginTop: 20 }}
                    bordered
                    dataSource={filteredTransactions}
                    renderItem={(tx) => {
                        const isSent = tx.type === 'sent';
                        const counterpart = isSent
                            ? tx.toName || 'Desconocido'
                            : tx.fromName || tx.awardedBy || 'Sistema';

                        return (
                            <List.Item style={{ position: 'relative', paddingTop: 30 }}>
                                <Button
                                    type="text"
                                    icon={<DownloadOutlined style={{ fontSize: 20, color: 'black' }} />}
                                    onClick={() => navigate('/comprobante', { state: { tx } })}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        padding: '6px 12px',
                                    }}
                                />
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
            ) : (
                <p>No hay transacciones para mostrar.</p>
            )}
        </div>
    );
};

export default Historial;
