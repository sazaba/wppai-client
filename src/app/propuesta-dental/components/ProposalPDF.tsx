/* src/components/ProposalPDF.tsx */
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';

// Definimos estilos (CSS-in-JS para PDF)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#050505', // Fondo oscuro
    padding: 40,
    color: '#E2E8F0', // Texto claro
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#F59E0B', // Dorado (Amber-500)
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 100, // Ajusta según necesites
    height: 'auto',
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 12,
    color: '#F59E0B', // Dorado
    marginBottom: 20,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  priceBox: {
    marginVertical: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#111111',
  },
  priceAmount: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  priceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 5,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletText: {
    fontSize: 12,
    color: '#CBD5E1',
    marginLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 10,
  },
});

// Importante: Recibimos el objeto de la imagen importada como prop
interface ProposalPDFProps {
  logoSrc: string; // Recibirá la ruta del logo
}

const ProposalPDF: React.FC<ProposalPDFProps> = ({ logoSrc }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* HEADER CON LOGO */}
      <View style={styles.header}>
        <View>
            <Text style={styles.title}>Propuesta Comercial</Text>
            <Text style={{ fontSize: 10, color: '#aaa' }}>Automatización Clínica</Text>
        </View>
        {/* Aquí renderizamos el logo de Wasaaa */}
        {/* Nota: react-pdf prefiere rutas strings o urls */}
        <Image style={styles.logo} src={logoSrc} />
      </View>

      {/* CUERPO */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Plan Élite Odontológico</Text>
        <Text style={{ fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
          Transforme la gestión de su clínica con nuestra solución de Inteligencia Artificial especializada.
        </Text>

        {/* CAJA DE PRECIO */}
        <View style={styles.priceBox}>
            <Text style={styles.priceAmount}>$ 250.000</Text>
            <Text style={styles.priceLabel}>COP / Mensual</Text>
        </View>

        {/* LISTA DE BENEFICIOS */}
        <View style={{ marginTop: 20 }}>
            <Text style={{ ...styles.subtitle, color: '#fff', fontSize: 14, marginBottom: 15 }}>
                INCLUYE:
            </Text>
            {[
                "300 Conversaciones IA Premium al mes",
                "Agenda Inteligente & Confirmación WhatsApp",
                "Dashboard de Métricas & Reactivación",
                "Soporte Técnico Prioritario",
                "Sin Cláusulas de Permanencia"
            ].map((item, i) => (
                <View key={i} style={styles.bulletPoint}>
                    <Text style={{ color: '#F59E0B' }}>•</Text>
                    <Text style={styles.bulletText}>{item}</Text>
                </View>
            ))}
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text>Documento generado automáticamente por el sistema.</Text>
        <Text>Este documento es una oferta comercial válida por 15 días.</Text>
      </View>
    </Page>
  </Document>
);

export default ProposalPDF;