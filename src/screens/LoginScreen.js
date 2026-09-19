import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { colors } from '../theme';
import { authApi } from '../api';

export default function LoginScreen({ onAuth }) {
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    try { const session = registering ? await authApi.register({ name, email, password }) : await authApi.login({ email, password }); await onAuth(session); }
    catch (error) { Alert.alert('No se pudo continuar', error.message); }
    finally { setLoading(false); }
  };
  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content}><Text style={styles.brand}>game<Text style={styles.accent}>cube</Text></Text><Text style={styles.title}>{registering ? 'Crea tu cuenta.' : 'Tu setup, más cerca.'}</Text><Text style={styles.intro}>{registering ? 'Regístrate para guardar tu carrito y comprar.' : 'Inicia sesión para seguir tus pedidos y guardar tus favoritos.'}</Text>{registering && <><Text style={styles.label}>NOMBRE</Text><TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Tu nombre" placeholderTextColor={colors.muted} /></>}<Text style={styles.label}>EMAIL</Text><TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="tu@email.com" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" /><Text style={styles.label}>CONTRASEÑA</Text><TextInput value={password} onChangeText={setPassword} style={styles.input} placeholder="Mínimo 6 caracteres" placeholderTextColor={colors.muted} secureTextEntry /><Pressable style={styles.login} onPress={submit} disabled={loading}><Text style={styles.loginText}>{loading ? 'Conectando...' : registering ? 'Crear cuenta' : 'Iniciar sesión'}</Text></Pressable><Pressable onPress={() => setRegistering(!registering)}><Text style={styles.account}>{registering ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}<Text style={styles.link}>{registering ? 'Inicia sesión' : 'Regístrate'}</Text></Text></Pressable></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: colors.background }, content: { padding: 24, paddingTop: 55 }, brand: { color: colors.white, fontSize: 31, fontWeight: '900' }, accent: { color: colors.purpleBright }, title: { color: colors.white, fontSize: 30, fontWeight: '900', marginTop: 65 }, intro: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 9, marginBottom: 35 }, label: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 8, marginTop: 16 }, input: { height: 51, backgroundColor: colors.surface, borderRadius: 13, paddingHorizontal: 15, color: colors.white, fontSize: 14, borderWidth: 1, borderColor: colors.line }, login: { height: 49, borderRadius: 13, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginTop: 23 }, loginText: { color: colors.background, fontSize: 13, fontWeight: '900' }, or: { color: colors.muted, fontSize: 12, textAlign: 'center', marginVertical: 20 }, social: { height: 49, borderRadius: 13, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, socialText: { color: colors.white, fontSize: 13, fontWeight: '800' }, account: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 24 }, link: { color: colors.purpleBright, fontWeight: '800' } });
