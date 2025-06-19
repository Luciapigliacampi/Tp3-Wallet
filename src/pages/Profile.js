import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Input, Button, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';

const Profile = () => {
  const { user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.post('https://raulocoin.onrender.com/api/auth0/balance', {
          email: user.email,
        });

        const { user: userData } = res.data;

        setProfileData({
          name: userData.name || '',
          username: userData.username || '',
          email: userData.email || '',
        });
      } catch (err) {
        console.error('Error al obtener perfil:', err);
        message.error(err?.response?.data?.message || 'No se pudo cargar el perfil');
      }
    };

    if (isAuthenticated && user?.email) {
      fetchProfile();
    }
  }, [isAuthenticated, user]);

  const handleSave = async () => {
    const { name, username, email } = profileData;

    if (name.length > 100) {
      return message.error('El nombre no puede superar los 100 caracteres');
    }

    if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
      return message.error(
        'El alias solo puede contener letras minúsculas, números, puntos, guiones y guiones bajos'
      );
    }

    setLoading(true);

    try {
      const res = await axios.post('https://raulocoin.onrender.com/api/auth0/edit-profile', {
        email,
        name,
        username,
      });

      if (res.data.success) {
        message.success(res.data.message);
        setEditMode(false);
      } else {
        message.error(res.data.message);
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="icon-container" style={{ marginBottom: 20 }}>
        <ArrowLeftOutlined
          onClick={() => navigate('/account')}
          className="logout-icon"
        />
        <p className="saludo">Perfil</p>
        <div style={{ width: 22 }} /> {/* Espaciador para centrar el título */}
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <img
          src={user?.picture}
          alt="Perfil"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #ccc',
          }}
        />
      </div>

      <div className="user-container">
        <label className="saludo">Nombre completo</label>
        <Input
          value={profileData.name}
          disabled={!editMode}
          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
          style={{ marginBottom: 10 }}
        />

        <label className="saludo">Alias</label>
        <Input
          value={profileData.username}
          disabled={!editMode}
          onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
          style={{ marginBottom: 10 }}
        />

        <label className="saludo">Correo electrónico</label>
        <Input value={profileData.email} disabled style={{ marginBottom: 20 }} />

        {editMode ? (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            block
            onClick={handleSave}
            className="auth-button"
          >
            Guardar cambios
          </Button>
        ) : (
          <Button
            icon={<EditOutlined />}
            block
            className="auth-button"
            onClick={() => setEditMode(true)}
          >
            Editar perfil
          </Button>
        )}
      </div>
    </div>
  );
};

export default Profile;
