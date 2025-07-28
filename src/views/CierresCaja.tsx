import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BARBEROS_KEY = 'barberos';
const barberosBase = [
  'jose.torres',
  'breiner.ferrer',
  'edinson.vergara',
];
function loadBarberos() {
  try {
    const data = localStorage.getItem(BARBEROS_KEY);
    return data ? JSON.parse(data) : barberosBase;
  } catch {
    return barberosBase;
  }
}

export default function CierresCaja() {
  const { facturas, cierres, agregarCierre } = useAppData();
  const { usuario } = useAuth();
  const [mensaje, setMensaje] = useState('');

  if (usuario?.rol === 'asistente') {
    return (
      <div style={{ padding: 32, color: 'var(--color-marron-oscuro)', textAlign: 'center' }}>
        <h2>Acceso denegado</h2>
        <p>No tienes permisos para ver los cierres de caja.</p>
      </div>
    );
  }

  // Cierre diario: solo recoge y guarda el dinero
  const handleCierreDiario = () => {
    const hoy = new Date().toISOString().slice(0, 10);
    const facturasHoy = facturas.filter(f => !f.abierta && f.fecha.slice(0, 10) === hoy);
    const totalEfectivo = facturasHoy.reduce((acc, f) => acc + f.efectivo, 0);
    const totalTransferencia = facturasHoy.reduce((acc, f) => acc + f.transferencia, 0);
    const doc = new jsPDF();
    doc.text('Cierre de Caja Diario', 14, 16);
    doc.text(`Fecha: ${hoy}`, 14, 24);
    doc.text(`Total efectivo: $${totalEfectivo}`, 14, 32);
    doc.text(`Total transferencia: $${totalTransferencia}`, 14, 40);
    autoTable(doc, {
      head: [['Cliente', 'Monto', 'Tipo de pago']],
      body: facturasHoy.map(f => [f.cliente, `$${f.efectivo + f.transferencia}`, f.tipoPago]),
      startY: 48,
    });
    doc.save(`cierre_diario_${hoy}.pdf`);
    agregarCierre({
      id: Math.random().toString(36).substring(2, 10),
      tipo: 'diario',
      fecha: hoy,
      detalle: `Cierre diario realizado por ${usuario?.usuario || 'usuario'}`,
    });
    setMensaje('Cierre diario realizado y PDF generado.');
  };

  // Cierre semanal: paga a barberos, calcula totales y reinicia datos (excepto inventario)
  const handleCierreSemanal = () => {
    const semana = new Date().toISOString().slice(0, 10);
    const facturasSemana = facturas.filter(f => !f.abierta); // Aquí puedes filtrar por semana real si lo deseas
    const totalEfectivo = facturasSemana.reduce((acc, f) => acc + f.efectivo, 0);
    const totalTransferencia = facturasSemana.reduce((acc, f) => acc + f.transferencia, 0);
    const totalFacturado = totalEfectivo + totalTransferencia;
    // Ganancia por productos
    const totalGananciaProductos = facturasSemana.reduce((acc, f) => acc + f.productos.reduce((a, p) => a + (p.precioSalida - p.precioEntrada), 0), 0);
    // Ganancia admin (50% servicios)
    const totalGananciaServiciosAdmin = facturasSemana.reduce((acc, f) => acc + f.servicios.reduce((a, s) => a + s.costo * 0.5, 0), 0);
    // Ganancia total admin
    const totalGananciaAdmin = totalGananciaServiciosAdmin + totalGananciaProductos;
    // Barberos
    const barberos = loadBarberos();
    const gananciasBarberos = barberos.map((b: string) => {
      const servicios = facturasSemana.flatMap(f => f.servicios.filter(s => s.barbero === b));
      const cortes = servicios.length;
      const ganado = servicios.reduce((acc, s) => acc + s.costo * 0.5, 0);
      const propinas = servicios.reduce((acc, s) => acc + (s.propina || 0), 0);
      return { barbero: b, cortes, ganado, propinas, total: ganado + propinas };
    });
    const totalEntregarBarberos = gananciasBarberos.reduce((acc: number, g: { total: number }) => acc + g.total, 0);
    // PDF
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('INVICTUS BARBER', 105, 16, { align: 'center' });
    doc.setFontSize(13);
    doc.text('Cierre de Caja Semanal', 105, 24, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Semana: ${semana}`, 14, 32);
    // Tabla de totales generales
    autoTable(doc, {
      head: [['Total en efectivo', 'Total en transferencia', 'Total facturado']],
      body: [[`$${totalEfectivo}`, `$${totalTransferencia}`, `$${totalFacturado}`]],
      startY: 36,
      styles: { halign: 'center', fontSize: 11 },
      headStyles: { fillColor: [76, 46, 0], textColor: 255 },
      margin: { left: 14, right: 14 },
    });
    // Tabla de pagos a barberos
    const pagosBarberosY = (doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY
      ? Math.round((doc as any).lastAutoTable.finalY + 8)
      : 64;
    autoTable(doc, {
      head: [['Barbero', 'Servicios', 'Ganado (50%)', 'Propinas (100%)', 'Total a entregar']],
      body: gananciasBarberos.map((g: { barbero: string; cortes: number; ganado: number; propinas: number; total: number; }) => [g.barbero, g.cortes, `$${g.ganado}`, `$${g.propinas}`, `$${g.total}`]),
      startY: pagosBarberosY,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [76, 46, 0], textColor: 255 },
      margin: { left: 14, right: 14 },
    });
    // Tabla de total a entregar a barberos
    const totalBarberosY = (doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY
      ? Math.round((doc as any).lastAutoTable.finalY + 8)
      : pagosBarberosY + 40;
    autoTable(doc, {
      head: [['Total a entregar a barberos']],
      body: [[`$${totalEntregarBarberos}`]],
      startY: totalBarberosY,
      styles: { fontSize: 11, halign: 'center' },
      headStyles: { fillColor: [218, 218, 218], textColor: 0 },
      margin: { left: 14, right: 14 },
    });
    // Tabla de ganancias del administrador
    const gananciasAdminY = (doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY
      ? Math.round((doc as any).lastAutoTable.finalY + 8)
      : totalBarberosY + 24;
    autoTable(doc, {
      head: [['Ganancia por productos', 'Ganancia por servicios (50%)', 'Ganancia total del administrador']],
      body: [[`$${totalGananciaProductos}`, `$${totalGananciaServiciosAdmin}`, `$${totalGananciaAdmin}`]],
      startY: gananciasAdminY,
      styles: { fontSize: 11, halign: 'center' },
      headStyles: { fillColor: [76, 46, 0], textColor: 255 },
      margin: { left: 14, right: 14 },
    });
    // Tabla de resumen final
    const resumenFinalY = (doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY
      ? Math.round((doc as any).lastAutoTable.finalY + 8)
      : gananciasAdminY + 24;
    autoTable(doc, {
      head: [['Total facturado', '(-) Total entregado a barberos', '(=) Ganancia del administrador']],
      body: [[`$${totalFacturado}`, `$${totalEntregarBarberos}`, `$${totalGananciaAdmin}`]],
      startY: resumenFinalY,
      styles: { fontSize: 12, halign: 'center', fontStyle: 'bold' },
      headStyles: { fillColor: [218, 218, 218], textColor: 0 },
      margin: { left: 14, right: 14 },
    });
    // Nota aclaratoria
    const notaY = (doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY
      ? Math.round((doc as any).lastAutoTable.finalY + 12)
      : resumenFinalY + 24;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Todos los valores corresponden únicamente a facturas cerradas durante la semana.', 14, notaY);
    doc.save(`cierre_semanal_${semana}.pdf`);
    agregarCierre({
      id: Math.random().toString(36).substring(2, 10),
      tipo: 'semanal',
      fecha: semana,
      detalle: `Cierre semanal realizado por ${usuario?.usuario || 'usuario'}`,
    });
    // Reiniciar facturas y cierres (excepto inventario)
    localStorage.setItem('facturas', '[]');
    localStorage.setItem('cierres', '[]');
    setMensaje('Cierre semanal realizado, PDF generado y datos reiniciados (excepto inventario).');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>Cierres de Caja</h2>
      {(usuario?.rol === 'admin' || usuario?.rol === 'asistente') && (
        <div style={{ background: 'var(--color-gris-claro)', color: 'black', padding: 24, borderRadius: 10, maxWidth: 500 }}>
          {(() => {
            // Cargar propinas pendientes
            let propinasPendientes = {};
            try {
              propinasPendientes = JSON.parse(localStorage.getItem('propinasPendientes') || '{}');
            } catch {
              // Ignorar errores de parsing
            }
            if (Object.values(propinasPendientes).some(v => (v as number) < 0)) {
              return <div style={{ color: 'red', fontWeight: 'bold', marginBottom: 12 }}>
                ¡Atención! Hay propinas pendientes negativas. Corrige esto antes de hacer el cierre semanal.
              </div>;
            }
            return null;
          })()}
          <h3>Cierre Diario</h3>
          <button onClick={handleCierreDiario} style={{ background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 'bold', fontSize: 16, marginBottom: 16 }}>Realizar cierre diario y descargar PDF</button>
          <h3>Cierre Semanal</h3>
          <button onClick={handleCierreSemanal} style={{ background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 'bold', fontSize: 16 }}>Realizar cierre semanal y descargar PDF</button>
          {mensaje && <div style={{ color: 'green', marginTop: 16 }}>{mensaje}</div>}
        </div>
      )}
      <div style={{ marginTop: 32, color: 'black' }}>
        <h3>Historial de cierres</h3>
        <ul>
          {cierres.map(c => (
            <li key={c.id}>{c.tipo} - {c.fecha} - {c.detalle}</li>
          ))}
        </ul>
      </div>
    </div>
  );
} 