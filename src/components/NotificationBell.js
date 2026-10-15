import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';
import { colors } from '../theme';

function notificationIcon(type) {
  if (type === 'favorite') return 'heart';
  if (type === 'support') return 'chat';
  if (type === 'order') return 'truck-fast-outline';
  return 'receipt-long';
}

function formatDate(value) {
  return new Date(value).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

export default function NotificationBell({ notifications = [], onOpen }) {
  const [visible, setVisible] = useState(false);
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const close = () => setVisible(false);

  return <>
    <Pressable style={styles.bellButton} onPress={() => { onOpen?.(); setVisible(true); }} accessibilityRole="button" accessibilityLabel={`Notificaciones${unreadCount ? `, ${unreadCount} sin leer` : ''}`}>
      <Icon name="bell-ring-outline" size={22} color={colors.white} />
      {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>}
    </Pressable>
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <View style={styles.titleIcon}><Icon name="bell-ring-outline" size={18} color={colors.background} /></View>
              <View><Text style={styles.title}>Notificaciones</Text><Text style={styles.subtitle}>{notifications.length ? 'Actividad reciente de tu cuenta' : 'Aquí verás las novedades de tu cuenta'}</Text></View>
            </View>
            <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Cerrar notificaciones"><Icon name="close" size={21} color={colors.muted} /></Pressable>
          </View>
          {notifications.length ? <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {notifications.map((notification) => <View key={notification.id} style={[styles.item, !notification.read && styles.unreadItem]}>
              <View style={[styles.itemIcon, !notification.read && styles.unreadIcon]}><Icon name={notificationIcon(notification.type)} size={17} color={!notification.read ? colors.background : colors.purpleBright} /></View>
              <View style={styles.copy}>
                <View style={styles.itemTitleRow}><Text style={styles.itemTitle}>{notification.title}</Text>{!notification.read && <View style={styles.unreadDot} />}</View>
                <Text style={styles.message}>{notification.message}</Text>
                <Text style={styles.date}>{formatDate(notification.createdAt)}</Text>
              </View>
            </View>)}
          </ScrollView> : <View style={styles.empty}>
            <Icon name="bell-ring-outline" size={29} color={colors.muted} />
            <Text style={styles.emptyTitle}>Sin notificaciones por ahora</Text>
            <Text style={styles.emptyText}>Te avisaremos cuando compres, guardes un favorito, cambie un pedido o soporte responda.</Text>
          </View>}
        </Pressable>
      </Pressable>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  bellButton: { width: 45, height: 45, borderRadius: 15, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  badge: { position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.background, fontSize: 9, fontWeight: '900' },
  overlay: { flex: 1, backgroundColor: 'rgba(4, 3, 9, 0.78)', alignItems: 'center', justifyContent: 'flex-start', padding: 18, paddingTop: 65 },
  panel: { width: '100%', maxWidth: 460, maxHeight: '78%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 21, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: colors.line },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  titleIcon: { width: 37, height: 37, borderRadius: 12, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.white, fontSize: 15, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 10, marginTop: 4 },
  list: { marginTop: 11 },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 11, borderRadius: 13, backgroundColor: colors.surface, marginBottom: 8, borderWidth: 1, borderColor: colors.line },
  unreadItem: { backgroundColor: '#202911', borderColor: '#354516' },
  itemIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  unreadIcon: { backgroundColor: colors.lime },
  copy: { flex: 1 },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  itemTitle: { color: colors.white, fontSize: 11, fontWeight: '900', flex: 1 },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.lime },
  message: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  date: { color: colors.muted, fontSize: 8, marginTop: 5 },
  empty: { alignItems: 'center', padding: 27, gap: 8 },
  emptyTitle: { color: colors.white, fontSize: 12, fontWeight: '900', textAlign: 'center' },
  emptyText: { color: colors.muted, fontSize: 10, lineHeight: 15, textAlign: 'center' },
});
