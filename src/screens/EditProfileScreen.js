import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Icon from '../components/Icon';
import { useMessage } from '../components/MessageProvider';
import { authApi } from '../api';
import { colors } from '../theme';

function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, editable = true }) {
  const [showValue, setShowValue] = useState(false);
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    {secureTextEntry ? <View style={[styles.passwordInput, !editable && styles.disabledInput]}>
      <TextInput value={value} onChangeText={onChangeText} editable={editable} placeholder={placeholder} placeholderTextColor={colors.muted} secureTextEntry={!showValue} keyboardType={keyboardType} autoCapitalize={autoCapitalize} style={styles.passwordTextInput} />
      <Pressable style={styles.visibilityButton} onPress={() => setShowValue((visible) => !visible)} accessibilityRole="button" accessibilityLabel={showValue ? 'Ocultar contraseña' : 'Mostrar contraseña'} accessibilityState={{ checked: showValue }}>
        <Icon name={showValue ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.muted} />
      </Pressable>
    </View> : <TextInput value={value} onChangeText={onChangeText} editable={editable} placeholder={placeholder} placeholderTextColor={colors.muted} keyboardType={keyboardType} autoCapitalize={autoCapitalize} style={[styles.input, !editable && styles.disabledInput]} />}
  </View>;
}

export default function EditProfileScreen({ navigation, token, user, onUserUpdated }) {
  const { showMessage } = useMessage();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [photo, setPhoto] = useState(user?.photo || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const choosePhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showMessage('Permiso requerido', 'Permite el acceso a tus fotos para elegir una imagen de perfil.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });
      if (!result.canceled && result.assets[0]?.base64) {
        const encodedPhoto = `data:image/jpeg;base64,${result.assets[0].base64}`;
        if (encodedPhoto.length > 1500000) {
          showMessage('La foto es demasiado grande', 'Elige una imagen más pequeña para poder guardarla en tu perfil.');
          return;
        }
        setPhoto(encodedPhoto);
      }
    } catch {
      showMessage('No se pudo abrir la galería', 'Inténtalo de nuevo. Si el problema continúa, revisa los permisos de fotos de tu dispositivo.');
    }
  };

  const save = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      showMessage('Falta tu nombre', 'Escribe tu nombre antes de guardar los cambios.');
      return;
    }
    if (phone.trim() && !/^[+\d\s()-]{7,20}$/.test(phone.trim())) {
      showMessage('Teléfono no válido', 'Escribe un teléfono de 7 a 20 caracteres usando números y, si hace falta, +, espacios o guiones.');
      return;
    }
    if (newPassword && (!currentPassword || newPassword.length < 8)) {
      showMessage('Revisa la contraseña', 'Para cambiarla, escribe tu contraseña actual y una nueva de al menos 8 caracteres.');
      return;
    }

    setSaving(true);
    try {
      const result = await authApi.updateProfile({
        name: cleanName,
        phone: phone.trim(),
        address: address.trim(),
        photo,
        ...(newPassword ? { currentPassword, newPassword } : {}),
      }, token);
      onUserUpdated(result.user);
      showMessage('Perfil actualizado', 'Tus datos se guardaron correctamente.', [{ text: 'Listo', onPress: () => navigation.goBack() }]);
    } catch (error) {
      showMessage('No se pudo guardar el perfil', error.message || 'Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable style={styles.back} onPress={() => navigation.goBack()} accessibilityLabel="Volver al perfil"><Icon name="arrow-left" size={21} color={colors.white} /></Pressable>
      <Text style={styles.kicker}>GAMECUBE ID</Text>
      <Text style={styles.title}>Editar perfil</Text>
      <Pressable style={styles.photoPicker} onPress={choosePhoto} accessibilityRole="button" accessibilityLabel="Elegir foto de perfil">
        {photo ? <Image source={{ uri: photo }} style={styles.photo} /> : <View style={styles.photoPlaceholder}><Icon name="account-circle-outline" size={40} color={colors.background} /></View>}
        <View style={styles.photoCopy}><Text style={styles.photoTitle}>Foto de perfil</Text><Text style={styles.photoHint}>Toca para cambiar tu imagen</Text></View>
        <Icon name="camera-outline" size={21} color={colors.purpleBright} />
      </Pressable>
      <Field label="NOMBRE" value={name} onChangeText={setName} placeholder="Tu nombre" autoCapitalize="words" />
      <Field label="CORREO" value={user?.email || ''} editable={false} placeholder="tu@email.com" keyboardType="email-address" autoCapitalize="none" />
      <Text style={styles.note}>El correo de inicio de sesión no se puede cambiar desde esta pantalla.</Text>
      <Field label="TELÉFONO" value={phone} onChangeText={setPhone} placeholder="Tu teléfono (opcional)" keyboardType="phone-pad" />
      <Field label="DIRECCIÓN HABITUAL" value={address} onChangeText={setAddress} placeholder="Calle, ciudad y código postal" />
      <View style={styles.passwordCard}>
        <Text style={styles.passwordTitle}>Cambiar contraseña</Text>
        <Text style={styles.note}>Déjalo vacío si no quieres cambiarla.</Text>
        <Field label="CONTRASEÑA ACTUAL" value={currentPassword} onChangeText={setCurrentPassword} placeholder="Tu contraseña actual" secureTextEntry autoCapitalize="none" />
        <Field label="NUEVA CONTRASEÑA" value={newPassword} onChangeText={setNewPassword} placeholder="Mínimo 8 caracteres" secureTextEntry autoCapitalize="none" />
      </View>
      <Pressable style={[styles.save, saving && styles.saveDisabled]} onPress={save} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.background} /> : <Text style={styles.saveText}>Guardar cambios</Text>}
      </Pressable>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 40 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 20 },
  kicker: { color: colors.purpleBright, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: colors.white, fontSize: 28, fontWeight: '900', marginTop: 5, marginBottom: 17 },
  photoPicker: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 13, marginBottom: 17 },
  photoPlaceholder: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  photo: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.surface },
  photoCopy: { flex: 1 },
  photoTitle: { color: colors.white, fontSize: 13, fontWeight: '800' },
  photoHint: { color: colors.muted, fontSize: 10, marginTop: 4 },
  field: { marginTop: 12 },
  label: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
  input: { minHeight: 47, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 13, color: colors.white, fontSize: 13 },
  passwordInput: { minHeight: 47, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingLeft: 13 },
  passwordTextInput: { flex: 1, minHeight: 45, color: colors.white, fontSize: 13, paddingRight: 8 },
  visibilityButton: { width: 46, minHeight: 45, alignItems: 'center', justifyContent: 'center' },
  disabledInput: { opacity: 0.55 },
  note: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 6 },
  passwordCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 14, marginTop: 20 },
  passwordTitle: { color: colors.white, fontSize: 14, fontWeight: '900' },
  save: { minHeight: 49, borderRadius: 13, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginTop: 19 },
  saveDisabled: { opacity: 0.65 },
  saveText: { color: colors.background, fontSize: 13, fontWeight: '900' },
});
