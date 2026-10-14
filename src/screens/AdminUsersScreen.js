import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useMessage } from '../components/MessageProvider';
import { adminApi } from '../api';
import { colors } from '../theme';

export default function AdminUsersScreen({ navigation, token }) {
  const { showMessage } = useMessage();
  const [users, setUsers] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await adminApi.users(token);
      setUsers(result.users.map((user) => ({ ...user, id: user.id || String(user._id) })));
      setErrorMessage('');
    } catch (error) {
      setUsers([]);
      setErrorMessage(error.message || 'No se pudieron cargar los usuarios.');
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      showMessage('Datos incompletos', 'El nombre y el correo son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      await adminApi.updateUser(editing.id, form, token);
      setEditing(null);
      await load();
      showMessage('Cambios guardados', 'Los datos del usuario se actualizaron correctamente.');
    } catch (error) {
      showMessage('No se pudo actualizar el usuario', error.message || 'Revisa los datos e inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const remove = (user) => showMessage('Eliminar usuario', `¿Quieres eliminar a ${user.name}? Esta acción no se puede deshacer.`, [
    { text: 'Cancelar' },
    { text: 'Eliminar', style: 'destructive', onPress: async () => {
      try {
        await adminApi.deleteUser(user.id, token);
        await load();
        showMessage('Usuario eliminado', 'La cuenta se eliminó correctamente.');
      } catch (error) {
        showMessage('No se pudo eliminar', error.message || 'Inténtalo de nuevo.');
      }
    } },
  ]);

  if (!users) return <SafeAreaView style={styles.safeArea}><ActivityIndicator color={colors.lime} style={styles.loader} /></SafeAreaView>;
  return <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Volver"><Icon name="arrow-left" size={22} color={colors.white} /></Pressable>
        <View><Text style={styles.kicker}>ADMINISTRACIÓN</Text><Text style={styles.title}>Usuarios</Text></View>
        <View style={styles.count}><Text style={styles.countText}>{users.length}</Text></View>
      </View>
      {errorMessage ? <View style={styles.form}><Text style={styles.formTitle}>No se pudo cargar la lista</Text><Text style={styles.email}>{errorMessage}</Text><Pressable style={styles.save} onPress={load}><Text style={styles.saveText}>Reintentar</Text></Pressable></View> : null}
      {editing && <View style={styles.form}>
        <Text style={styles.formTitle}>Editar usuario</Text>
        <TextInput value={form.name} onChangeText={(name) => setForm({ ...form, name })} placeholder="Nombre" placeholderTextColor={colors.muted} style={styles.input} />
        <TextInput value={form.email} onChangeText={(email) => setForm({ ...form, email })} placeholder="Email" placeholderTextColor={colors.muted} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <View style={styles.formActions}>
          <Pressable onPress={() => setEditing(null)}><Text style={styles.cancel}>Cancelar</Text></Pressable>
          <Pressable style={[styles.save, saving && styles.disabled]} onPress={save} disabled={saving}><Text style={styles.saveText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text></Pressable>
        </View>
      </View>}
      {users.length === 0 && !errorMessage ? <View style={styles.empty}><Icon name="account-multiple-outline" size={35} color={colors.purpleBright} /><Text style={styles.email}>Aún no hay usuarios registrados.</Text></View> : null}
      {users.map((user) => <View key={user.id || user._id} style={styles.row}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user.name.slice(0, 1).toUpperCase()}</Text></View>
        <View style={styles.info}><Text style={styles.name}>{user.name}</Text><Text style={styles.email}>{user.email}</Text></View>
        <Pressable style={styles.rowButton} onPress={() => { setEditing(user); setForm({ name: user.name, email: user.email }); }} accessibilityLabel={`Editar a ${user.name}`}><Icon name="edit" size={19} color={colors.purpleBright} /></Pressable>
        <Pressable style={styles.rowButton} onPress={() => remove(user)} accessibilityLabel={`Eliminar a ${user.name}`}><Icon name="delete-outline" size={19} color={colors.danger} /></Pressable>
      </View>)}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1 },
  content: { padding: 18, paddingBottom: 35 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 12, marginBottom: 23 },
  kicker: { color: colors.purpleBright, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: colors.white, fontSize: 28, fontWeight: '900', marginTop: 4 },
  count: { marginLeft: 'auto', backgroundColor: colors.lime, minWidth: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  countText: { color: colors.background, fontWeight: '900' },
  row: { backgroundColor: colors.card, borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: colors.line },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  avatarText: { color: colors.white, fontWeight: '900', fontSize: 16 },
  info: { flex: 1 },
  name: { color: colors.white, fontSize: 13, fontWeight: '800' },
  email: { color: colors.muted, fontSize: 11, marginTop: 4, lineHeight: 16 },
  rowButton: { padding: 9 },
  form: { backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginBottom: 16, borderWidth: 1, borderColor: colors.purpleBright },
  formTitle: { color: colors.white, fontSize: 15, fontWeight: '900', marginBottom: 9 },
  input: { height: 45, color: colors.white, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 12, marginTop: 8 },
  formActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 15, marginTop: 13 },
  cancel: { color: colors.muted, fontWeight: '800' },
  save: { backgroundColor: colors.lime, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10, alignItems: 'center', marginTop: 12 },
  saveText: { color: colors.background, fontWeight: '900', fontSize: 11 },
  disabled: { opacity: 0.6 },
  empty: { alignItems: 'center', padding: 30, gap: 10 },
});
