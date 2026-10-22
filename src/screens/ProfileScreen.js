import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import BottomNav from '../components/BottomNav';
import { colors, createAdaptiveStyles } from '../theme';

export default function ProfileScreen({ navigation, cartCount, user, onLogout }) {
  const links = [
    ...(user?.role !== 'admin' ? [{ label: 'Historial de pedidos', icon: 'receipt-long', screen: 'OrderHistory', requiresLogin: true }] : []),
    { label: 'Chat de soporte', icon: 'lifebuoy', screen: 'SupportChat', requiresLogin: true },
    { label: 'Preguntas frecuentes', icon: 'help-circle-outline', screen: 'Faq' },
  ];

  return <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>GAMECUBE ID</Text>
      <Text style={styles.title}>Tu perfil</Text>
      {user ? <>
        <View style={styles.profile}>
          {user.photo ? <Image source={{ uri: user.photo }} style={styles.avatarImage} /> : <View style={styles.avatar}><Icon name="account-circle" size={32} color={colors.ink} /></View>}
          <View style={styles.profileInfo}>
            <Text style={styles.profileTitle}>{user.name}</Text>
            <Text style={styles.profileSubtitle}>{user.email}</Text>
            {user.phone ? <Text style={styles.profileSubtitle}>{user.phone}</Text> : null}
          </View>
        </View>
        <Pressable style={styles.edit} onPress={() => navigation.navigate('EditProfile')} accessibilityRole="button">
          <Icon name="account-edit-outline" size={20} color={colors.ink} /><Text style={styles.editText}>Editar perfil</Text>
        </Pressable>
        <Pressable style={styles.logout} onPress={onLogout}>
          <Icon name="logout-variant" size={20} color={colors.white} /><Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </> : <>
        <View style={styles.profile}>
          <View style={styles.avatar}><Icon name="account-circle-outline" size={32} color={colors.ink} /></View>
          <View style={styles.profileInfo}><Text style={styles.profileTitle}>Aún no has iniciado sesión</Text><Text style={styles.profileSubtitle}>Guarda tus datos para comprar más rápido</Text></View>
        </View>
        <Pressable style={styles.edit} onPress={() => navigation.navigate('Login')}><Icon name="login-variant" size={20} color={colors.ink} /><Text style={styles.editText}>Iniciar sesión</Text></Pressable>
        <Pressable style={styles.register} onPress={() => navigation.navigate('Login')}><Icon name="account-plus-outline" size={20} color={colors.purpleBright} /><Text style={styles.registerText}>Crear una cuenta</Text></Pressable>
      </>}
      <View style={styles.links}>
        {links.map((link) => <Pressable key={link.screen} style={styles.link} onPress={() => navigation.navigate(link.requiresLogin && !user ? 'Login' : link.screen)}>
          <Icon name={link.icon} size={23} color={colors.purpleBright} /><Text style={styles.linkText}>{link.label}</Text><Icon name="chevron-right" size={20} color={colors.muted} />
        </Pressable>)}
      </View>
    </ScrollView>
    <BottomNav active="profile" navigation={navigation} cartCount={cartCount} />
  </SafeAreaView>;
}

const styles = createAdaptiveStyles({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 120 },
  kicker: { color: colors.purpleBright, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginTop: 12 },
  title: { color: colors.white, fontSize: 32, fontWeight: '900', marginTop: 5 },
  profile: { backgroundColor: colors.card, borderRadius: 17, padding: 16, flexDirection: 'row', alignItems: 'center', marginTop: 25 },
  profileInfo: { flex: 1 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  avatarImage: { width: 56, height: 56, borderRadius: 28, marginRight: 13, backgroundColor: colors.surface },
  profileTitle: { color: colors.white, fontSize: 14, fontWeight: '800' },
  profileSubtitle: { color: colors.muted, fontSize: 11, marginTop: 5 },
  edit: { height: 49, borderRadius: 14, backgroundColor: colors.lime, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 15 },
  editText: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  logout: { height: 46, borderRadius: 14, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 9 },
  logoutText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  register: { height: 49, borderRadius: 14, borderWidth: 1, borderColor: colors.purpleBright, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 },
  registerText: { color: colors.purpleBright, fontSize: 13, fontWeight: '900' },
  links: { backgroundColor: colors.card, borderRadius: 17, paddingHorizontal: 16, marginTop: 24 },
  link: { minHeight: 61, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.line },
  linkText: { flex: 1, color: colors.white, fontSize: 13, fontWeight: '700', marginLeft: 12 },
});
