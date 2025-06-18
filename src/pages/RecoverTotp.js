import React, { useState } from 'react';
import { Input, Button, Form, Typography, message, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Paragraph } = Typography;

const RecoverTotp = () => {
  const [loading, setLoading] = useState(false);
  const [totpData, setTotpData] = useState(null);
  const navigate = useNavigate();

  const handleVolver = () => {
    navigate('/');
  };

  const onFinish = async (values) => {
    setLoading(true);
    setTotpData(null);

    try {
      const response = await axios.post("https://raulocoin.onrender.com/api/regenerate-totp", {
        username: values.alias,
        email: values.email,
      });

      const res = response.data;

      if (res.success) {
        message.success(res.message);
        setTotpData(res.totpSetup);
      } else {
        message.error(res.message || "No se pudo recuperar el TOTP");
      }

    } catch (error) {
      console.error("Error al recuperar TOTP:", error);
      message.error("Error al contactar el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recover-container" style={{ maxWidth: 450, margin: 'auto', paddingTop: '3rem' }}>
      <Button onClick={handleVolver} style={{ marginBottom: '1rem' }}>
        ← Volver
      </Button>

      <Title level={2} style={{ textAlign: 'center' }}>Recuperar TOTP</Title>

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Alias"
          name="alias"
          rules={[{ required: true, message: 'Por favor ingresa tu alias' }]}
        >
          <Input placeholder="Tu alias" />
        </Form.Item>

        <Form.Item
          label="Correo electrónico"
          name="email"
          rules={[{ required: true, message: 'Por favor ingresa tu correo' }]}
        >
          <Input type="email" placeholder="correo@ejemplo.com" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Recuperar
          </Button>
        </Form.Item>
      </Form>

      {totpData && (
        <div style={{ marginTop: 30, textAlign: 'center' }}>
          <Alert
            message="Nueva configuración TOTP"
            description="Usá esta información para configurar tu autenticador nuevamente."
            type="success"
            showIcon
          />
          <img src={totpData.qrCodeUrl} alt="QR Code" style={{ marginTop: 20 }} />
          <Paragraph copyable style={{ marginTop: 20 }}>
            <strong>Código manual:</strong> {totpData.manualSetupCode}
          </Paragraph>
          <Paragraph>{totpData.instructions}</Paragraph>
        </div>
      )}
    </div>
  );
};

export default RecoverTotp;
