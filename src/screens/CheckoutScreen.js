import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { colors, formatPrice } from '../theme';

const SHIPPING_COST = 0;
const PAYMENT_METHODS = [
  { id: 'card', label: 'Tarjeta de crédito o débito', icon: 'credit-card-outline' },
  { id: 'paypal', label: 'PayPal', icon: 'paypal' },
  { id: 'transfer', label: 'Transferencia bancaria', icon: 'bank-outline' },
  { id: 'cash', label: 'Efectivo en OXXO', icon: 'store-outline' },
];

function getOrderItems(cart) {
  const items = new Map();
  cart.forEach((product) => {
    const item = items.get(product.id);
    if (item) item.quantity += 1;
    else items.set(product.id, { ...product, quantity: 1 });
  });
  return [...items.values()];
}

function formatCardNumber(value) {
  return value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
}

function isValidCardNumber(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let doubleDigit = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

function isValidExpiry(value) {
  const match = value.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export default function CheckoutScreen({ navigation, cart, onUpdateQuantity, onPaymentCompleted }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardholder, setCardholder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState({ street: '', city: '', postalCode: '', reference: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [order, setOrder] = useState(null);
  const items = getOrderItems(cart);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + SHIPPING_COST;

  const validatePayment = () => {
    if (paymentMethod === 'card') {
      if (!cardholder.trim()) return 'Escribe el nombre que aparece en la tarjeta.';
      if (!isValidCardNumber(cardNumber)) return 'Revisa el número de tarjeta.';
      if (!isValidExpiry(expiry)) return 'Escribe una fecha de vencimiento válida (MM/AA).';
      if (!/^\d{3,4}$/.test(cvc)) return 'El código de seguridad debe tener 3 o 4 dígitos.';
    }
    if (paymentMethod === 'paypal' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail.trim())) {
      return 'Escribe un correo válido para simular el pago con PayPal.';
    }
    if (!shippingAddress.street.trim() || !shippingAddress.city.trim() || !/^[\da-zA-Z -]{4,10}$/.test(shippingAddress.postalCode.trim())) {
      return 'Completa calle, ciudad y un código postal válido.';
    }
    return '';
  };

  const pay = async () => {
    if (!items.length) {
      setErrorMessage('Tu carrito está vacío.');
      return;
    }
    const validationError = validatePayment();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const last4 = paymentMethod === 'card' ? cardNumber.replace(/\D/g, '').slice(-4) : undefined;
      const completedOrder = await onPaymentCompleted(paymentMethod, last4, shippingAddress);
      setCardholder('');
      setCardNumber('');
      setExpiry('');
      setCvc('');
      setPaypalEmail('');
      setShippingAddress({ street: '', city: '', postalCode: '', reference: '' });
      setOrder(completedOrder);
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo guardar la compra simulada. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (order) {
    const methodLabel = PAYMENT_METHODS.find((method) => method.id === order.paymentMethod)?.label;
    return <SafeAreaView style={styles.safeArea}>
      <View style={styles.success}>
        <View style={styles.successIcon}><Icon name="check" size={45} color={colors.background} /></View>
        <Text style={styles.kicker}>PAGO SIMULADO</Text>
        <Text style={styles.title}>¡Pedido confirmado!</Text>
        <Text style={styles.copy}>Esta compra es una demostración local: no se realizó ningún cargo ni se enviaron datos a Stripe, PayPal o un banco.</Text>
        <View style={styles.orderCard}>
          <Text style={styles.orderLabel}>NÚMERO DE PEDIDO</Text>
          <Text style={styles.orderValue}>{order.orderId}</Text>
          <View style={styles.separator} />
          <Text style={styles.orderLabel}>MÉTODO</Text>
          <Text style={styles.orderValue}>{methodLabel || order.paymentMethod}{order.last4 ? ` •••• ${order.last4}` : ''}</Text>
          <View style={styles.separator} />
          <Text style={styles.orderLabel}>TOTAL SIMULADO</Text>
          <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
        </View>
        <Pressable style={styles.primary} onPress={() => navigation.navigate('Main', { screen: 'home' })}>
          <Text style={styles.primaryText}>Volver a la tienda</Text>
        </Pressable>
      </View>
    </SafeAreaView>;
  }

  return <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable style={styles.back} onPress={() => navigation.goBack()} accessibilityLabel="Volver al carrito">
        <Icon name="arrow-left" size={20} color={colors.white} /><Text style={styles.backText}>Carrito</Text>
      </Pressable>
      <Text style={styles.kicker}>MODO DEMOSTRACIÓN</Text>
      <Text style={styles.title}>Resumen del pedido</Text>
      <Text style={styles.disclaimer}>Elige una forma de pago para simular el checkout. No se procesan cargos reales.</Text>

      {items.length === 0 ? <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <Pressable style={styles.secondary} onPress={() => navigation.navigate('Main', { screen: 'home' })}><Text style={styles.secondaryText}>Explorar productos</Text></Pressable>
      </View> : <>
        <View style={styles.list}>
          {items.map((item) => <View style={styles.item} key={item.id}>
            <View style={styles.itemInfo}>
              <Text style={styles.name}>{item.shortName || item.name}</Text>
              <Text style={styles.unitPrice}>{formatPrice(item.price)} c/u</Text>
              <Text style={styles.lineTotal}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
            <View style={styles.quantity}>
              <Pressable style={styles.quantityButton} onPress={() => onUpdateQuantity(item.id, item.quantity - 1)} disabled={loading} accessibilityLabel={`Disminuir cantidad de ${item.shortName || item.name}`}><Text style={styles.quantitySymbol}>−</Text></Pressable>
              <Text style={styles.quantityValue}>{item.quantity}</Text>
              <Pressable style={styles.quantityButton} onPress={() => onUpdateQuantity(item.id, item.quantity + 1)} disabled={loading || item.quantity >= 99} accessibilityLabel={`Aumentar cantidad de ${item.shortName || item.name}`}><Text style={styles.quantitySymbol}>+</Text></Pressable>
            </View>
          </View>)}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Envío</Text><Text style={styles.shipping}>GRATIS</Text></View>
          <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>{formatPrice(total)}</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Dirección de envío</Text>
        <View style={styles.form}>
          <TextInput value={shippingAddress.street} onChangeText={(street) => setShippingAddress((current) => ({ ...current, street }))} style={styles.input} placeholder="Calle y número" placeholderTextColor={colors.muted} />
          <View style={styles.cardDetails}>
            <TextInput value={shippingAddress.city} onChangeText={(city) => setShippingAddress((current) => ({ ...current, city }))} style={[styles.input, styles.addressInput]} placeholder="Ciudad" placeholderTextColor={colors.muted} />
            <TextInput value={shippingAddress.postalCode} onChangeText={(postalCode) => setShippingAddress((current) => ({ ...current, postalCode: postalCode.slice(0, 10) }))} style={[styles.input, styles.postalInput]} placeholder="C.P." placeholderTextColor={colors.muted} autoCapitalize="characters" />
          </View>
          <TextInput value={shippingAddress.reference} onChangeText={(reference) => setShippingAddress((current) => ({ ...current, reference }))} style={styles.input} placeholder="Referencias (opcional)" placeholderTextColor={colors.muted} />
        </View>

        <Text style={styles.sectionTitle}>Forma de pago</Text>
        <View style={styles.methods}>
          {PAYMENT_METHODS.map((method) => <Pressable
            key={method.id}
            style={[styles.method, paymentMethod === method.id && styles.methodSelected]}
            onPress={() => {
              setPaymentMethod(method.id);
              setErrorMessage('');
              if (method.id !== 'card') {
                setCardholder('');
                setCardNumber('');
                setExpiry('');
                setCvc('');
              }
              if (method.id !== 'paypal') setPaypalEmail('');
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: paymentMethod === method.id }}
          >
            <Icon name={method.icon} size={21} color={paymentMethod === method.id ? colors.lime : colors.muted} />
            <Text style={[styles.methodText, paymentMethod === method.id && styles.methodTextSelected]}>{method.label}</Text>
            <View style={[styles.radio, paymentMethod === method.id && styles.radioSelected]} />
          </Pressable>)}
        </View>

        {paymentMethod === 'card' && <View style={styles.form}>
          <Text style={styles.fieldLabel}>NOMBRE EN LA TARJETA</Text>
          <TextInput value={cardholder} onChangeText={setCardholder} style={styles.input} placeholder="Nombre del titular" placeholderTextColor={colors.muted} autoCapitalize="words" />
          <Text style={styles.fieldLabel}>NÚMERO DE TARJETA</Text>
          <TextInput value={cardNumber} onChangeText={(value) => setCardNumber(formatCardNumber(value))} style={styles.input} placeholder="4242 4242 4242 4242" placeholderTextColor={colors.muted} keyboardType="number-pad" maxLength={23} />
          <View style={styles.cardDetails}>
            <View style={styles.cardDetailInput}>
              <Text style={styles.fieldLabel}>VENCIMIENTO</Text>
              <TextInput value={expiry} onChangeText={(value) => setExpiry(formatExpiry(value))} style={styles.input} placeholder="MM/AA" placeholderTextColor={colors.muted} keyboardType="number-pad" maxLength={5} />
            </View>
            <View style={styles.cardDetailInput}>
              <Text style={styles.fieldLabel}>CVC</Text>
              <TextInput value={cvc} onChangeText={(value) => setCvc(value.replace(/\D/g, '').slice(0, 4))} style={styles.input} placeholder="123" placeholderTextColor={colors.muted} keyboardType="number-pad" secureTextEntry maxLength={4} />
            </View>
          </View>
          <Text style={styles.cardHint}>Para probar usa 4242 4242 4242 4242, fecha futura y CVC 123. El número completo y el CVC se validan solo en este dispositivo y nunca se guardan; el pedido solo muestra los últimos 4 dígitos.</Text>
        </View>}

        {paymentMethod === 'paypal' && <View style={styles.form}>
          <Text style={styles.fieldLabel}>CORREO DE PAYPAL (SIMULADO)</Text>
          <TextInput value={paypalEmail} onChangeText={setPaypalEmail} style={styles.input} placeholder="tu@email.com" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.cardHint}>No escribas tu contraseña de PayPal. No se abrirá ni contactará ningún servicio externo.</Text>
        </View>}

        {(paymentMethod === 'transfer' || paymentMethod === 'cash') && <View style={styles.infoCard}>
          <Text style={styles.cardHint}>{paymentMethod === 'transfer' ? 'Se registrará una transferencia bancaria de demostración, sin datos de cuenta ni movimiento real.' : 'Se registrará un pago en efectivo de demostración; no se generará una ficha de pago real.'}</Text>
        </View>}

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <Pressable style={[styles.primary, loading && styles.primaryDisabled]} onPress={pay} disabled={loading}>
          <Text style={styles.primaryText}>{loading ? 'Guardando simulación...' : `Simular pago de ${formatPrice(total)}`}</Text>
          {!loading && <Icon name="check-circle-outline" size={18} color={colors.background} />}
        </Pressable>
      </>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8, marginBottom: 18 },
  backText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  kicker: { color: colors.purpleBright, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginTop: 5 },
  title: { color: colors.white, fontSize: 28, fontWeight: '900', marginTop: 5 },
  disclaimer: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  list: { marginTop: 20 },
  item: { backgroundColor: colors.card, borderRadius: 15, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  itemInfo: { flex: 1, paddingRight: 8 },
  name: { color: colors.white, fontSize: 14, fontWeight: '800' },
  unitPrice: { color: colors.muted, fontSize: 11, marginTop: 5 },
  lineTotal: { color: colors.white, fontSize: 13, fontWeight: '800', marginTop: 5 },
  quantity: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  quantityButton: { width: 31, height: 31, borderWidth: 1, borderColor: colors.line, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quantitySymbol: { color: colors.white, fontSize: 19, lineHeight: 23 },
  quantityValue: { color: colors.white, minWidth: 18, textAlign: 'center', fontSize: 13, fontWeight: '800' },
  summary: { backgroundColor: colors.card, borderRadius: 15, padding: 16, marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { color: colors.muted, fontSize: 13 },
  summaryValue: { color: colors.white, fontSize: 13, fontWeight: '700' },
  shipping: { color: colors.lime, fontSize: 11, fontWeight: '900' },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 14, marginTop: 2, marginBottom: 0 },
  totalLabel: { color: colors.white, fontSize: 15, fontWeight: '900' },
  totalValue: { color: colors.white, fontSize: 19, fontWeight: '900' },
  sectionTitle: { color: colors.white, fontSize: 17, fontWeight: '900', marginTop: 25, marginBottom: 11 },
  methods: { gap: 8 },
  method: { minHeight: 53, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 13, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  methodSelected: { borderColor: colors.lime },
  methodText: { flex: 1, color: colors.muted, fontSize: 12, fontWeight: '700' },
  methodTextSelected: { color: colors.white },
  radio: { width: 17, height: 17, borderRadius: 9, borderWidth: 1, borderColor: colors.muted },
  radioSelected: { borderColor: colors.lime, borderWidth: 5 },
  form: { marginTop: 16 },
  fieldLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 7, marginTop: 12 },
  input: { minHeight: 48, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 13, color: colors.white, fontSize: 13 },
  cardDetails: { flexDirection: 'row', gap: 10 },
  cardDetailInput: { flex: 1 },
  addressInput: { flex: 1 },
  postalInput: { width: 105 },
  cardHint: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 10 },
  infoCard: { backgroundColor: colors.card, borderRadius: 13, padding: 14, marginTop: 14 },
  error: { color: colors.danger, fontSize: 12, lineHeight: 18, marginTop: 12 },
  primary: { minHeight: 50, paddingHorizontal: 18, borderRadius: 14, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, marginTop: 20 },
  primaryDisabled: { opacity: 0.55 },
  primaryText: { color: colors.background, fontSize: 13, fontWeight: '900' },
  secondary: { minHeight: 46, paddingHorizontal: 18, borderRadius: 13, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  secondaryText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { color: colors.white, fontSize: 18, fontWeight: '900' },
  success: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  successIcon: { width: 82, height: 82, borderRadius: 41, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  copy: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 10 },
  orderCard: { alignSelf: 'stretch', backgroundColor: colors.card, borderRadius: 16, padding: 18, marginTop: 28 },
  orderLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  orderValue: { color: colors.white, fontSize: 13, fontWeight: '800', marginTop: 7 },
  separator: { height: 1, backgroundColor: colors.line, marginVertical: 16 },
  orderTotal: { color: colors.lime, fontSize: 21, fontWeight: '900', marginTop: 5 },
});
