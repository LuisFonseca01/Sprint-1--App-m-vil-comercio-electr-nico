import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { colors, createAdaptiveStyles } from '../theme';

export default function WelcomeScreen({ navigation }) {
  return <SafeAreaView style={styles.safeArea}>
    <View style={styles.content}>
      <View style={styles.logo}><Icon name="controller-classic-outline" size={52} color={colors.ink} /></View>
      <Text style={styles.kicker}>TU UNIVERSO GAMER</Text>
      <Text style={styles.title}>Bienvenido a <Text style={styles.brand}>Gamecube</Text></Text>
      <Text style={styles.description}>Encuentra todo lo que necesitas para llevar tu setup al siguiente nivel.</Text>
      <Pressable style={styles.button} onPress={() => navigation.replace('Main', { screen: 'home' })}>
        <Text style={styles.buttonText}>Comenzar a explorar</Text>
        <Icon name="arrow-right" size={19} color={colors.ink} />
      </Pressable>
      <View style={styles.footer}><Icon name="security" size={17} color={colors.purpleBright} /><Text style={styles.footerText}>Tecnología para jugar sin límites</Text></View>
    </View>
  </SafeAreaView>;
}

const styles = createAdaptiveStyles({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  logo: { width: 106, height: 106, borderRadius: 34, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  kicker: { color: colors.purpleBright, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  title: { color: colors.white, fontSize: 34, lineHeight: 42, fontWeight: '900', textAlign: 'center', marginTop: 13 },
  brand: { color: colors.purpleBright },
  description: { color: colors.muted, fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 12, maxWidth: 300 },
  button: { minHeight: 54, borderRadius: 16, backgroundColor: colors.lime, paddingHorizontal: 21, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 11, marginTop: 34 },
  buttonText: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  footer: { position: 'absolute', bottom: 30, flexDirection: 'row', alignItems: 'center', gap: 7 },
  footerText: { color: colors.muted, fontSize: 11 },
});
