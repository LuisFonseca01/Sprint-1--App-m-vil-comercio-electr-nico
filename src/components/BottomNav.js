import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';
import { colors } from '../theme';

export default function BottomNav({ active, navigation, cartCount }) {
  const items = [
    { id: 'home', label: 'Inicio', icon: 'home-variant-outline', activeIcon: 'home-variant' },
    { id: 'categories', label: 'Categorías', icon: 'view-grid-outline', activeIcon: 'view-grid' },
    { id: 'cart', label: 'Carrito', icon: 'cart-outline', activeIcon: 'cart' },
    { id: 'profile', label: 'Perfil', icon: 'account-circle-outline', activeIcon: 'account-circle' },
  ];
  return (
    <View style={styles.nav}>
      {items.map((item) => <Pressable key={item.id} style={styles.item} onPress={() => navigation.navigate('Main', { screen: item.id })}>
        <View><Icon name={active === item.id ? item.activeIcon : item.icon} size={24} color={active === item.id ? colors.lime : colors.muted} />{item.id === 'cart' && cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>}</View>
        <Text style={[styles.label, active === item.id && styles.activeLabel]}>{item.label}</Text>
      </Pressable>)}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 79, backgroundColor: '#100C1A', borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, zIndex: 100, elevation: 24, boxShadow: '0px -5px 12px rgba(0, 0, 0, 0.35)' },
  item: { alignItems: 'center', width: 74 },
  label: { color: colors.muted, fontSize: 10, marginTop: 4, fontWeight: '700' },
  activeLabel: { color: colors.lime },
  badge: { position: 'absolute', right: -8, top: -4, backgroundColor: colors.pink, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.background, fontSize: 8, fontWeight: '900' },
});
