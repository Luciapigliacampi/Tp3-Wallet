import React, { useEffect } from 'react';
import { Button, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

const Comprobante = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const tx = state?.tx;

  useEffect(() => {
    if (!tx) {
      message.error('No hay datos para mostrar el comprobante');
      navigate('/historial');
    }
  }, [tx, navigate]);

  const generarPDF = () => {
    if (!tx) return;

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

    doc.text(` De: ${tx.fromName || tx.from?.name || 'Sistema'} (${tx.fromUsername || tx.from?.username || ''})`, 25, y); y += 10;
    doc.text(` Para: ${tx.toName || tx.to?.name || 'Desconocido'} (${tx.toUsername || tx.to?.username || ''})`, 25, y); y += 10;
    doc.text(` Monto: ${tx.amount} Raulocoins`, 25, y); y += 10;
    doc.text(` Descripción: ${tx.description || '-'}`, 25, y); y += 10;
    doc.text(` Fecha: ${new Date((tx.timestamp || tx.createdAt) * 1000).toLocaleString()}`, 25, y);

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Gracias por usar Raulocoin', 105, 130, null, null, 'center');

    doc.save('comprobante-transferencia.pdf');
  };

  if (!tx) return null;

  return (
    <div className="card">
      <h2 className="title">Comprobante</h2>
      <p><strong>De:</strong> {tx.fromName || tx.from?.name} (@{tx.fromUsername || tx.from?.username})</p>
      <p><strong>Para:</strong> {tx.toName || tx.to?.name} (@{tx.toUsername || tx.to?.username})</p>
      <p><strong>Monto:</strong> {tx.amount} Raulocoins</p>
      <p><strong>Descripción:</strong> {tx.description || '-'}</p>
      <p><strong>Fecha:</strong> {new Date((tx.timestamp || tx.createdAt) * 1000).toLocaleString()}</p>

      <Button className="button" onClick={generarPDF}>
        Descargar PDF
      </Button>

      <Button className="button" onClick={() => navigate('/account')} style={{ marginTop: '1rem' }}>
        Volver a cuenta
      </Button>
    </div>
  );
};

export default Comprobante;
