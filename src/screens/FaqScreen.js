import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { colors, createAdaptiveStyles } from '../theme';

const QUESTIONS = [
  ['¿Cómo hago un pedido?', 'Añade los productos al carrito, revisa el resumen, completa tu dirección y confirma el método de pago de demostración.'],
  ['¿Se realizan cargos reales?', 'No. Los pagos con tarjeta, PayPal, transferencia y efectivo son simulaciones; no se envía información financiera a servicios externos.'],
  ['¿Dónde consulto mis pedidos?', 'En tu perfil, abre “Historial de pedidos” para revisar fechas, estados, productos, dirección y mensajes de seguimiento.'],
  ['¿Qué significan los estados del pedido?', '“En proceso” indica que se está preparando, “Enviado” que salió a entrega, “Entregado” que llegó a su destino y “Cancelado” que ya no continúa.'],
  ['¿Cómo sabré si cambia el estado?', 'El historial se actualiza automáticamente mientras está abierto y muestra un mensaje con la fecha de cada cambio realizado por administración.'],
  ['¿Cuánto cuesta el envío?', 'El envío aparece en el resumen antes de confirmar. Actualmente la tienda muestra envío gratis.'],
  ['¿Puedo cambiar la cantidad antes de pagar?', 'Sí. Usa los botones de cantidad en el resumen del pedido; el subtotal y el total se recalculan automáticamente.'],
  ['¿Cómo actualizo mis datos?', 'En tu perfil selecciona “Editar perfil”. Ahí puedes cambiar tu nombre, teléfono, dirección, foto y contraseña.'],
  ['¿Cómo puedo contactar a soporte?', 'Abre “Chat de soporte” desde tu perfil y envía tu consulta. Puedes volver a la conversación para revisar las respuestas.'],
  ['¿Qué hago si la app muestra un error?', 'Comprueba tu conexión a internet y que el servidor esté disponible. Revisa que los campos obligatorios estén completos y vuelve a intentarlo.'],
];

export default function FaqScreen({ navigation }) {
  const [openIndex, setOpenIndex] = useState(null);
  return <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable style={styles.back} onPress={() => navigation.goBack()} accessibilityLabel="Volver al perfil"><Icon name="arrow-left" size={21} color={colors.white} /></Pressable>
      <Text style={styles.kicker}>GAMECUBE AYUDA</Text>
      <Text style={styles.title}>Preguntas frecuentes</Text>
      <Text style={styles.subtitle}>Respuestas rápidas para comprar y dar seguimiento a tus pedidos.</Text>
      {QUESTIONS.map(([question, answer], index) => {
        const expanded = openIndex === index;
        return <Pressable key={question} style={styles.card} onPress={() => setOpenIndex(expanded ? null : index)} accessibilityRole="button" accessibilityState={{ expanded }}>
          <View style={styles.row}><Text style={styles.question}>{question}</Text><Icon name={expanded ? 'minus' : 'plus'} size={20} color={colors.lime} /></View>
          {expanded && <Text style={styles.answer}>{answer}</Text>}
        </Pressable>;
      })}
    </ScrollView>
  </SafeAreaView>;
}

const styles = createAdaptiveStyles({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 35 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 22 },
  kicker: { color: colors.purpleBright, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: colors.white, fontSize: 28, fontWeight: '900', marginTop: 5 },
  subtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8, marginBottom: 15 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 15, marginTop: 9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  question: { color: colors.white, fontSize: 13, fontWeight: '800', flex: 1 },
  answer: { color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: 12 },
});
