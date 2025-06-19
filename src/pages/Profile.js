import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [editing, setEditing] = useState(false);
  const [originalName, setOriginalName] = useState('');

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    if (username) {
      axios.get(`https://raulocoin.onrender.com/api/auth0/balance?username=${username}`)
        .then((res) => {
          const user = res.data.user;
          setName(user.name);
          setAlias(user.username);
          setEmail(user.email);
          setOriginalName(user.name);
        })
        .catch((err) => console.error('Error al obtener perfil:', err));
    }
  }, []);

  const handleSave = async () => {
    try {
      const response = await axios.post('https://raulocoin.onrender.com/api/auth0/edit-profile', {
        username: alias,
        name,
      });

      if (response.data.success) {
        alert('Nombre actualizado con éxito');
        sessionStorage.setItem('name', name);
        setOriginalName(name);
        setEditing(false);
      } else {
        alert(response.data.message || 'No se pudo actualizar');
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('Error al actualizar el perfil');
    }
  };

  const handleCancel = () => {
    setName(originalName);
    setEditing(false);
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="auth-title">Mi perfil</h1>
        <p className="auth-subtitle">Visualizá y editá tus datos</p>

        <input
          className="auth-input"
          type="text"
          value={alias}
          disabled
        />

        <input
          className="auth-input"
          type="email"
          value={email}
          disabled
        />

        <input
          className="auth-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!editing}
        />

        {editing ? (
          <>
            <button className="auth-button" onClick={handleSave}>Guardar</button>
            <button className="auth-button" onClick={handleCancel} style={{ marginTop: '10px' }}>
              Cancelar
            </button>
          </>
        ) : (
          <button className="auth-button" onClick={() => setEditing(true)}>Editar nombre</button>
        )}
      </div>
    </div>
  );
};

export default Profile;