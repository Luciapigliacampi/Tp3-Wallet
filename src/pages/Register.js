import React, { useState } from 'react';
import { Button, Input } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [alias, setAlias] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
        name: nombre,
        username: alias,  
        email: email, 
    };

    axios.post('https://raulocoin.onrender.com/api/register', data)
      .then((response) => {
        const res = response.data;
        if (res.success) {
          navigate('/totp', { state: res.totpSetup });
        } else {
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
    };

    return (
        <div className="login-container">
            <img
                src={"/assets/raulCoin.png"}
                alt={"raulCoin"}
                className='logo-img'
            />
            <h1 className='auth-title'>Regístrate</h1>
            <p className='auth-subtitle'>¡Empecemos esta aventura juntos!</p>
            <form onSubmit={handleSubmit}>
                <Input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className='auth-input'
                />
                <Input
                type="text"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='auth-input'
                />
                <Input
                type="text"
                placeholder="Alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                required
                className='auth-input'
                />
                <Button type="primary" htmlType="submit" className='auth-button' disabled={loading}>
                {loading ? 'Cargando...' : 'Registrarme'}
                </Button>

                <p className='auth-p-end'>
                <Link className='auth-link' to="/">Iniciar sesión</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;
