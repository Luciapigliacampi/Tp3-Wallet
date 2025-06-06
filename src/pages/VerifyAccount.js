import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Input, Button } from 'antd';

const VerifyAccount = () => {
    const location = useLocation();
    const [alias, setAlias] = useState(location.state?.alias || '');
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
      
        const data = {
            username: alias,
            totpToken: codigo,
        };
      
        try {
            const verifyResponse = await axios.post('https://raulocoin.onrender.com/api/verify-totp-setup', data);
            const verifyRes = verifyResponse.data;
        
            if (verifyRes.success) {
                const userResponse = await axios.post('https://raulocoin.onrender.com/api/user-details', data);
                const userRes = userResponse.data;
        
                if (userRes.success && userRes.user) {
                navigate('/account', {
                    state: {
                    name: userRes.user.name,
                    username: userRes.user.username,
                    balance: userRes.user.balance,
                    },
                });
                } else {
                alert('No se pudieron obtener los datos del usuario.');
                }
            } else {
                alert('Código TOTP incorrecto.');
            }
        } catch (error) {
            alert('Error al verificar el código TOTP.');
        } finally {
            setLoading(false);
        }
    };      
    

    return (
        <div className="login-container">
        <img
            src="/assets/raulCoin.png"
            alt="raulCoin"
            className="logo-img"
        />
        <h1 className="auth-title">Verifica tu cuenta</h1>
        <p className="auth-subtitle">¡Es necesario verificar para continuar!</p>
        <form onSubmit={handleSubmit}>
            <Input
            type="text"
            placeholder="Alias"
            disabled="disabled"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            required
            className="auth-input"
            />
            <Input
            type="text"
            placeholder="Código TOTP"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
            className="auth-input"
            />
            <Button type="primary" htmlType="submit" className="auth-button" disabled={loading}>
            {loading ? 'Cargando...' : 'Verificar'}
            </Button>
            <p className="auth-p-end">
            <Link className="auth-link" to="/">Volver</Link>
            </p>
        </form>
        </div>
    );
};

export default VerifyAccount;
