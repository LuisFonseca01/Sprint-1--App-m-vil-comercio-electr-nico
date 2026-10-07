import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import Icon from '../components/Icon';
import { ordersApi } from '../api';
import { colors, formatPrice } from '../theme';

const STATUS_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'processing', label: 'En proceso' },
  { id: 'shipped', label: 'Enviado' },
  { id: 'delivered', label: 'Entregado' },
  { id: 'cancelled', label: 'Cancelado' },
];

function statusLabel(status) {
  if (status === 'simulated' || status === 'confirmed') return 'En proceso';
  return STATUS_FILTERS.find((item) => item.id === status)?.label || 'Pendiente';
}

function displayOrderId(order) {
  return order.orderId || order.id || order._id;
}

function groupOrderItems(items = []) {
  const grouped = new Map();
  items.forEach((item) => {
    const key = `${item.id || item.name}-${item.price}`;
    const existing = grouped.get(key);
    if (existing) existing.quantity += item.quantity || 1;
    else grouped.set(key, { ...item, quantity: item.quantity || 1 });
  });
  return [...grouped.values()];
}

export default function OrderHistoryScreen({ navigation, token }) {
  const [orders, setOrders] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const isFocused = useIsFocused();

  const load = useCallback(async () => {
    try {
      const result = await ordersApi.get(token);
      setOrders(result.orders || []);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo cargar tu historial.');
    }
  }, [token]);

  useEffect(() => {
    if (!isFocused) return undefined;
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load, isFocused]);

  const invalidDateFilter = useMemo(() => {
    const validDate = (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
    return !validDate(fromDate) || !validDate(toDate) || Boolean(fromDate && toDate && fromDate > toDate);
  }, [fromDate, toDate]);

  const filteredOrders = useMemo(() => {
    if (!orders || invalidDateFilter) return [];
    return orders.filter((order) => {
      const createdAt = new Date(order.createdAt || order.date || 0);
      const date = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
      const orderStatus = ['simulated', 'confirmed'].includes(order.status) ? 'processing' : order.status;
      return (selectedStatus === 'all' || orderStatus === selectedStatus)
        && (!fromDate || date >= fromDate)
        && (!toDate || date <= toDate);
    });
  }, [orders, selectedStatus, fromDate, toDate, invalidDateFilter]);

  return <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.lime} />}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()} accessibilityLabel="Volver"><Icon name="arrow-left" size={21} color={colors.white} /></Pressable>
        <View><Text style={styles.kicker}>TU CUENTA</Text><Text style={styles.title}>Mis pedidos</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Filtrar por fecha</Text>
      <View style={styles.dateFilters}>
        <View style={styles.dateInputWrap}>
          <Text style={styles.fieldLabel}>DESDE</Text>
          <TextInput value={fromDate} onChangeText={setFromDate} placeholder="AAAA-MM-DD" placeholderTextColor={colors.muted} style={styles.dateInput} autoCapitalize="none" />
        </View>
        <View style={styles.dateInputWrap}>
          <Text style={styles.fieldLabel}>HASTA</Text>
          <TextInput value={toDate} onChangeText={setToDate} placeholder="AAAA-MM-DD" placeholderTextColor={colors.muted} style={styles.dateInput} autoCapitalize="none" />
        </View>
      </View>
      {invalidDateFilter && <Text style={styles.error}>Usa fechas AAAA-MM-DD válidas y un rango en orden.</Text>}
      <Text style={styles.sectionTitle}>Estado</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {STATUS_FILTERS.map((filter) => <Pressable key={filter.id} style={[styles.filter, selectedStatus === filter.id && styles.activeFilter]} onPress={() => setSelectedStatus(filter.id)}>
          <Text style={[styles.filterText, selectedStatus === filter.id && styles.activeFilterText]}>{filter.label}</Text>
        </Pressable>)}
      </ScrollView>

      {orders === null ? <ActivityIndicator color={colors.lime} style={styles.loader} /> : errorMessage ? <View style={styles.empty}>
        <Text style={styles.emptyText}>{errorMessage}</Text>
        <Pressable style={styles.retry} onPress={load}><Text style={styles.retryText}>Reintentar</Text></Pressable>
      </View> : filteredOrders.length === 0 ? <View style={styles.empty}>
        <Icon name="receipt-long" size={39} color={colors.purpleBright} />
        <Text style={styles.emptyTitle}>No hay pedidos para esos filtros</Text>
      </View> : filteredOrders.map((order) => {
        const orderId = displayOrderId(order);
        const expanded = expandedId === orderId;
        const date = new Date(order.createdAt || order.date || Date.now());
        const items = groupOrderItems(order.items);
        const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        return <View key={orderId} style={styles.orderCard}>
          <Pressable style={styles.orderHeader} onPress={() => setExpandedId(expanded ? null : orderId)}>
            <View style={styles.orderMain}>
              <Text style={styles.orderId}>Pedido #{String(orderId).slice(-8)}</Text>
              <Text style={styles.orderDate}>{date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })} · {itemCount} producto{itemCount === 1 ? '' : 's'}</Text>
            </View>
            <View style={styles.orderAside}>
              <Text style={styles.orderTotal}>{formatPrice(order.total || 0)}</Text>
              <View style={[styles.status, order.status === 'delivered' && styles.statusDelivered, order.status === 'cancelled' && styles.statusCancelled]}>
                <Text style={styles.statusText}>{statusLabel(order.status)}</Text>
              </View>
            </View>
            <Icon name={expanded ? 'expand-less' : 'expand-more'} size={21} color={colors.muted} />
          </Pressable>
          {expanded && <View style={styles.details}>
            <Text style={styles.detailHeading}>PRODUCTOS</Text>
            {items.map((item, index) => {
              const quantity = item.quantity || 1;
              return <View style={styles.productRow} key={`${item.id || item.name}-${index}`}>
                <Text style={styles.productName}>{item.shortName || item.name || 'Producto'} × {quantity}</Text>
                <Text style={styles.productPrice}>{formatPrice(item.price * quantity)}</Text>
              </View>;
            })}
            <View style={styles.detailRule} />
            <View style={styles.productRow}><Text style={styles.detailLabel}>Subtotal</Text><Text style={styles.detailValue}>{formatPrice(order.subtotal ?? order.total ?? 0)}</Text></View>
            <View style={styles.productRow}><Text style={styles.detailLabel}>Envío</Text><Text style={styles.detailValue}>{order.shippingCost ? formatPrice(order.shippingCost) : 'Gratis'}</Text></View>
            <View style={styles.detailRule} />
            <Text style={styles.detailHeading}>DIRECCIÓN DE ENVÍO</Text>
            <Text style={styles.address}>{[order.shippingAddress?.street, order.shippingAddress?.city, order.shippingAddress?.postalCode, order.shippingAddress?.reference].filter(Boolean).join(', ') || 'No se registró una dirección de envío.'}</Text>
            {order.paymentMethod && <Text style={styles.payment}>Pago simulado: {order.paymentMethod}{order.last4 ? ` ·•••• ${order.last4}` : ''}</Text>}
          </View>}
        </View>;
      })}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 12, marginBottom: 20 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  kicker: { color: colors.purpleBright, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: colors.white, fontSize: 27, fontWeight: '900', marginTop: 4 },
  sectionTitle: { color: colors.white, fontSize: 13, fontWeight: '900', marginTop: 12, marginBottom: 9 },
  dateFilters: { flexDirection: 'row', gap: 9 },
  dateInputWrap: { flex: 1 },
  fieldLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 5 },
  dateInput: { height: 42, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 10, color: colors.white, fontSize: 12 },
  error: { color: colors.danger, fontSize: 11, marginTop: 7 },
  filters: { gap: 7, paddingBottom: 8 },
  filter: { backgroundColor: colors.surface, borderRadius: 15, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.line },
  activeFilter: { borderColor: colors.lime, backgroundColor: colors.card },
  filterText: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  activeFilterText: { color: colors.lime },
  loader: { marginTop: 45 },
  empty: { alignItems: 'center', paddingTop: 55, gap: 10 },
  emptyTitle: { color: colors.white, fontSize: 14, fontWeight: '800', marginTop: 7 },
  emptyText: { color: colors.muted, fontSize: 12, textAlign: 'center' },
  retry: { padding: 10 },
  retryText: { color: colors.lime, fontWeight: '900' },
  orderCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 15, marginTop: 10, overflow: 'hidden' },
  orderHeader: { minHeight: 82, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderMain: { flex: 1 },
  orderId: { color: colors.white, fontSize: 13, fontWeight: '900' },
  orderDate: { color: colors.muted, fontSize: 10, marginTop: 6 },
  orderAside: { alignItems: 'flex-end', gap: 6 },
  orderTotal: { color: colors.white, fontSize: 14, fontWeight: '900' },
  status: { backgroundColor: '#423817', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 },
  statusDelivered: { backgroundColor: '#203B27' },
  statusCancelled: { backgroundColor: '#46232B' },
  statusText: { color: colors.white, fontSize: 9, fontWeight: '800' },
  details: { borderTopWidth: 1, borderTopColor: colors.line, padding: 14 },
  detailHeading: { color: colors.purpleBright, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 8 },
  productName: { color: colors.white, fontSize: 11, flex: 1 },
  productPrice: { color: colors.white, fontSize: 11, fontWeight: '800' },
  detailRule: { height: 1, backgroundColor: colors.line, marginVertical: 9 },
  detailLabel: { color: colors.muted, fontSize: 11 },
  detailValue: { color: colors.white, fontSize: 11, fontWeight: '800' },
  address: { color: colors.white, fontSize: 11, lineHeight: 17 },
  payment: { color: colors.muted, fontSize: 10, marginTop: 10 },
});
