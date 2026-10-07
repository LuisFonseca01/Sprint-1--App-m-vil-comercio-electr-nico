import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { adminOrdersApi } from '../api';
import { colors, formatPrice } from '../theme';

const STATUSES = [
  { id: 'processing', label: 'En proceso' },
  { id: 'shipped', label: 'Enviado' },
  { id: 'delivered', label: 'Entregado' },
  { id: 'cancelled', label: 'Cancelar' },
];

function orderId(order) {
  return order.id || order._id;
}

export default function AdminOrdersScreen({ navigation, token }) {
  const [orders, setOrders] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await adminOrdersApi.get(token);
      setOrders(result.orders || []);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'No se pudieron cargar los pedidos.');
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (order, status) => {
    const id = orderId(order);
    setUpdatingId(id);
    setErrorMessage('');
    try {
      const result = await adminOrdersApi.updateStatus(id, status, token);
      setOrders((current) => current.map((item) => orderId(item) === id ? { ...item, ...result.order } : item));
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo cambiar el estado del pedido.');
    } finally {
      setUpdatingId(null);
    }
  };

  return <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.lime} />}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()}><Icon name="arrow-left" size={21} color={colors.white} /></Pressable>
        <View style={styles.heading}><Text style={styles.kicker}>ADMINISTRACIÓN</Text><Text style={styles.title}>Pedidos</Text></View>
        {orders && <View style={styles.count}><Text style={styles.countText}>{orders.length}</Text></View>}
      </View>
      <Text style={styles.subtitle}>Actualiza el estado y los cambios se reflejarán en el historial del cliente.</Text>
      {errorMessage ? <View style={styles.errorCard}><Text style={styles.error}>{errorMessage}</Text><Pressable onPress={load}><Text style={styles.retry}>Reintentar</Text></Pressable></View> : null}
      {orders === null ? <ActivityIndicator color={colors.lime} style={styles.loader} /> : orders.length === 0 ? <View style={styles.empty}><Icon name="receipt-long" size={40} color={colors.purpleBright} /><Text style={styles.emptyText}>Aún no hay pedidos.</Text></View> : orders.map((order) => {
        const id = orderId(order);
        const customer = typeof order.user === 'object' ? order.user : null;
        return <View key={id} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.orderMark}><Icon name="receipt-long" size={19} color={colors.background} /></View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>#{String(id).slice(-8)}</Text>
              <Text style={styles.customer}>{customer?.name || order.customerName || 'Cliente'}</Text>
              {(customer?.email || order.customerEmail) && <Text style={styles.email}>{customer?.email || order.customerEmail}</Text>}
            </View>
            <View style={styles.orderAside}><Text style={styles.total}>{formatPrice(order.total || 0)}</Text><Text style={styles.currentStatus}>{STATUSES.find((item) => item.id === order.status)?.label || order.status || 'Pendiente'}</Text></View>
          </View>
          <Text style={styles.date}>{new Date(order.createdAt || Date.now()).toLocaleString('es-MX')}</Text>
          <View style={styles.actions}>
            {STATUSES.map((status) => <Pressable
              key={status.id}
              onPress={() => updateStatus(order, status.id)}
              disabled={updatingId === id || order.status === status.id}
              style={[styles.statusButton, order.status === status.id && styles.statusButtonActive, status.id === 'cancelled' && styles.cancelButton]}
            >
              <Text style={[styles.statusButtonText, order.status === status.id && styles.statusButtonTextActive, status.id === 'cancelled' && styles.cancelText]}>{updatingId === id ? '...' : status.label}</Text>
            </Pressable>)}
          </View>
        </View>;
      })}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 35 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, marginBottom: 8 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1 },
  kicker: { color: colors.purpleBright, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: colors.white, fontSize: 28, fontWeight: '900', marginTop: 4 },
  count: { minWidth: 32, height: 32, borderRadius: 16, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  countText: { color: colors.background, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 11, lineHeight: 17, marginBottom: 14 },
  loader: { marginTop: 45 },
  errorCard: { backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 12 },
  error: { color: colors.danger, fontSize: 11 },
  retry: { color: colors.lime, fontWeight: '900', marginTop: 8 },
  empty: { alignItems: 'center', paddingTop: 55, gap: 12 },
  emptyText: { color: colors.muted, fontSize: 13 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 14, marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderMark: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  orderInfo: { flex: 1 },
  orderId: { color: colors.white, fontSize: 12, fontWeight: '900' },
  customer: { color: colors.white, fontSize: 11, marginTop: 4 },
  email: { color: colors.muted, fontSize: 9, marginTop: 3 },
  orderAside: { alignItems: 'flex-end' },
  total: { color: colors.white, fontSize: 14, fontWeight: '900' },
  currentStatus: { color: colors.lime, fontSize: 9, fontWeight: '800', marginTop: 4 },
  date: { color: colors.muted, fontSize: 9, marginTop: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  statusButton: { borderWidth: 1, borderColor: colors.line, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 7 },
  statusButtonActive: { borderColor: colors.lime, backgroundColor: '#28320B' },
  cancelButton: { borderColor: '#693440' },
  statusButtonText: { color: colors.muted, fontSize: 9, fontWeight: '800' },
  statusButtonTextActive: { color: colors.lime },
  cancelText: { color: colors.danger },
});
