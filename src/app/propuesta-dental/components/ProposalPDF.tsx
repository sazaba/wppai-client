/* src/components/ProposalPDF.tsx */
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#050505',
    color: '#F8FAFC',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#F59E0B',
    paddingBottom: 20,
  },
  logo: {
    width: 120,
    height: 'auto',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 10,
    color: '#F59E0B',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#F59E0B',
    marginBottom: 15,
    marginTop: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 1.6,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  gridItem: {
    width: '48%',
    padding: 12,
    backgroundColor: '#111111',
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#3B82F6',
  },
  gridTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gridText: {
    fontSize: 9,
    color: '#94A3B8',
  },
  priceSection: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  priceAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  priceSub: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 5,
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  bulletDot: {
    width: 4,
    height: 4,
    backgroundColor: '#F59E0B',
    marginRight: 10,
    borderRadius: 2,
  },
  bulletText: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 15,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#475569',
  }
});

interface ProposalPDFProps {
  logoSrc: string;
}

const ProposalPDF: React.FC<ProposalPDFProps> = ({ logoSrc }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.mainTitle}>PROPUESTA ELITE</Text>
          <Text style={styles.tagline}>Inteligencia Artificial Odontológica</Text>
        </View>
        {/* Validamos que exista logoSrc antes de renderizar para evitar errores de PDF vacíos */}
        {logoSrc && <Image style={styles.logo} src={logoSrc} />}
      </View>

      {/* INTRODUCCIÓN */}
      <Text style={styles.sectionTitle}>Resumen de la Solución</Text>
      <Text style={styles.description}>
        Implementación de un ecosistema digital diseñado para automatizar la captación, 
        agendamiento y retención de pacientes, eliminando la carga operativa manual y 
        optimizando el flujo de caja de la clínica.
      </Text>

      {/* PILARES OPERATIVOS */}
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={styles.gridTitle}>Recepcionista IA 24/7</Text>
          <Text style={styles.gridText}>Atención inmediata en WhatsApp con terminología experta.</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridTitle}>Agenda Inteligente</Text>
          <Text style={styles.gridText}>Confirmación automática y gestión de ausentismo.</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridTitle}>Dashboard de Métricas</Text>
          <Text style={styles.gridText}>Control absoluto de pacientes nuevos e inactivos.</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridTitle}>Motor de Reactivación</Text>
          <Text style={styles.gridText}>Identificación de oportunidades de retorno de pacientes.</Text>
        </View>
      </View>

      {/* INVERSIÓN MENSUAL */}
      <View style={styles.priceSection}>
        <Text style={{ fontSize: 10, color: '#94A3B8', marginBottom: 10 }}>INVERSIÓN MENSUAL</Text>
        <Text style={styles.priceAmount}>$ 250.000</Text>
        <Text style={styles.priceSub}>Pesos Colombianos (COP)</Text>
      </View>

      {/* DETALLES DEL PLAN */}
      <Text style={styles.sectionTitle}>Beneficios Incluidos</Text>
      <View>
        {[
          "300 Conversaciones IA Premium mensuales",
          "Recargas adicionales con 80% de descuento",
          "Gestión multi-doctor y multi-sede",
          "Soporte técnico prioritario y actualizaciones",
          "Sin cláusulas de permanencia"
        ].map((benefit, i) => (
          <View key={i} style={styles.bullet}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>{benefit}</Text>
          </View>
        ))}
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Wasaaa AI - Automatización Clínica Profesional</Text>
        <Text style={styles.footerText}>Válido por 15 días a partir de la fecha de descarga.</Text>
      </View>
    </Page>
  </Document>
);

export default ProposalPDF;