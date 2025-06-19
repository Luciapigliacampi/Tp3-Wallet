import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!alias || !email || !nombre) {
      message.error('Por favor completá todos los campos');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('https://raulocoin.onrender.com/api/register', {
        username: alias,
        email,
        name: nombre,
      });

      const res = response.data;

      if (res.success) {
        const user = res.user;
        const totpSetup = res.totpSetup;

        // Guardar datos en sessionStorage
        sessionStorage.setItem('username', user.username);
        sessionStorage.setItem('name', user.name);
        sessionStorage.setItem('email', user.email);

        navigate('/verify-account', {
          state: {
            username: user.username,
            qrData: totpSetup,
            isNewUser: true,
          },
        });
      } else {
        message.error(res.message || 'Error al registrar usuario');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      message.error('Error del servidor');
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <h2 className="title">Registrarse</h2>

      <Input
        className="input"
        placeholder="Alias"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
      />

      <Input
        className="input"
        placeholder="Nombre completo"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <Input
        className="input"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button className="button" onClick={handleRegister} loading={loading}>
        Registrarme
      </Button>

      <a href="/" className="link">
        ¿Ya tenés cuenta? Iniciar sesión
      </a>
    </div>
  );
};

export default Register;
