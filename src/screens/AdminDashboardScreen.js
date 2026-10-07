import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { adminApi } from '../api';
import { colors, formatPrice } from '../theme';

function Trend({ values, color }) {
  const max = Math.max(...values, 1);
  return <View style={styles.chart}>{values.map((value, index) => <View key={`${value}-${index}`} style={styles.barColumn}><View style={[styles.bar, { height: `${(value / max) * 100}%`, backgroundColor: color }]} /><Text style={styles.chartLabel}>{index + 1}</Text></View>)}</View>;
}

export default function AdminDashboardScreen({ navigation, user, token }) {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => { try { setData(await adminApi.dashboard(token)); } finally { setRefreshing(false); } };
  useEffect(() => { load(); }, []);
  if (!data) return <SafeAreaView style={styles.safeArea}><ActivityIndicator color={colors.lime} style={styles.loader} /></SafeAreaView>;
  const cards = [{ label: 'Ventas', value: formatPrice(data.metrics.sales), icon: 'trending-up', color: colors.lime }, { label: 'Usuarios', value: data.metrics.users, icon: 'people', color: colors.purpleBright }, { label: 'Productos', value: data.metrics.products, icon: 'inventory-2', color: colors.pink }, { label: 'Pedidos', value: data.metrics.orders, icon: 'receipt-long', color: '#60A5FA' }];
  return <SafeAreaView style={styles.safeArea}><ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.lime} />} contentContainerStyle={styles.content}>
    <View style={styles.top}><View><Text style={styles.kicker}>PANEL DE CONTROL</Text><Text style={styles.title}>Hola, {user.name}</Text></View><Pressable style={styles.iconButton} onPress={() => navigation.navigate('Main', { screen: 'profile' })}><Icon name="arrow-left" size={21} color={colors.white} /></Pressable></View>
    <Text style={styles.updated}>Datos operativos en tiempo real</Text><View style={styles.metrics}>{cards.map((card) => <View key={card.label} style={styles.metric}><Icon name={card.icon} size={20} color={card.color} /><Text style={styles.metricValue}>{card.value}</Text><Text style={styles.metricLabel}>{card.label}</Text></View>)}</View>
    <View style={styles.section}><View style={styles.sectionHead}><Text style={styles.sectionTitle}>Ventas de la semana</Text><Text style={styles.sectionMeta}>MXN</Text></View><Trend values={data.salesTrend} color={colors.lime} /></View>
    <View style={styles.section}><View style={styles.sectionHead}><Text style={styles.sectionTitle}>Usuarios activos</Text><Text style={styles.sectionMeta}>últimos 7 días</Text></View><Trend values={data.userTrend} color={colors.purpleBright} /></View>
    <View style={styles.section}><Text style={styles.sectionTitle}>Productos más vendidos</Text>{data.topProducts.map((product) => <View key={product.id} style={styles.productRow}><View style={styles.productDot} /><Text style={styles.productName} numberOfLines={1}>{product.name}</Text><Text style={styles.sold}>{product.sold} uds.</Text></View>)}</View>
    <View style={styles.actions}>
      <Pressable style={styles.action} onPress={() => navigation.navigate('AdminOrders')}><Icon name="receipt-long" size={20} color={colors.background} /><Text style={styles.actionText}>Pedidos</Text></Pressable>
      <Pressable style={[styles.action, styles.secondaryAction]} onPress={() => navigation.navigate('AdminSupport')}><Icon name="chat" size={20} color={colors.lime} /><Text style={[styles.actionText, styles.secondaryText]}>Soporte</Text></Pressable>
      <Pressable style={[styles.action, styles.secondaryAction]} onPress={() => navigation.navigate('AdminUsers')}><Icon name="people" size={20} color={colors.lime} /><Text style={[styles.actionText, styles.secondaryText]}>Usuarios</Text></Pressable>
      <Pressable style={[styles.action, styles.secondaryAction]} onPress={() => navigation.navigate('AdminProducts')}><Icon name="inventory-2" size={20} color={colors.lime} /><Text style={[styles.actionText, styles.secondaryText]}>Productos</Text></Pressable>
    </View>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: colors.background }, loader: { flex: 1 }, content: { padding: 18, paddingBottom: 35 }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }, kicker: { color: colors.lime, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 }, title: { color: colors.white, fontSize: 28, fontWeight: '900', marginTop: 5 }, updated: { color: colors.muted, fontSize: 12, marginTop: 7 }, iconButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, metrics: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginTop: 22 }, metric: { width: '48%', minHeight: 105, backgroundColor: colors.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.line }, metricValue: { color: colors.white, fontSize: 22, fontWeight: '900', marginTop: 12 }, metricLabel: { color: colors.muted, fontSize: 11, marginTop: 3 }, section: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginTop: 14, borderWidth: 1, borderColor: colors.line }, sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionTitle: { color: colors.white, fontSize: 15, fontWeight: '900' }, sectionMeta: { color: colors.muted, fontSize: 10 }, chart: { height: 125, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', marginTop: 18, borderBottomWidth: 1, borderBottomColor: colors.line }, barColumn: { height: '100%', width: 25, alignItems: 'center', justifyContent: 'flex-end' }, bar: { width: 16, minHeight: 4, borderRadius: 5 }, chartLabel: { color: colors.muted, fontSize: 9, marginTop: 6, marginBottom: -15 }, productRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15 }, productDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lime, marginRight: 9 }, productName: { color: colors.white, flex: 1, fontSize: 12 }, sold: { color: colors.muted, fontSize: 11 }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 15 }, action: { flexBasis: '48%', flexGrow: 1, height: 48, borderRadius: 13, backgroundColor: colors.lime, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, secondaryAction: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lime }, actionText: { color: colors.background, fontWeight: '900', fontSize: 12 }, secondaryText: { color: colors.lime } });
