import { useState } from 'react';
import { Linking, Modal, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Icon from './Icon';
import { colors, formatPrice } from '../theme';

const SOCIAL_OPTIONS = [
  { id: 'facebook', label: 'Facebook', color: '#1877F2' },
  { id: 'x', label: 'X', color: '#111111' },
  { id: 'instagram', label: 'Instagram', color: '#C13584' },
];

function socialIcon(platform) {
  if (platform === 'facebook') return <FontAwesome6 name="facebook-f" brand size={21} color={colors.white} />;
  if (platform === 'x') return <FontAwesome6 name="x-twitter" brand size={19} color={colors.white} />;
  return <FontAwesome6 name="instagram" brand size={21} color={colors.white} />;
}

export default function ProductShareButton({ product, compact = false }) {
  const [visible, setVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sharing, setSharing] = useState(false);
  const shareUrl = product.shareUrl || product.image || '';
  const shareText = `Mira ${product.name} en Gamecube por ${formatPrice(product.price)}.${shareUrl ? ` ${shareUrl}` : ''}`;

  const share = async (platform) => {
    setErrorMessage('');
    setSharing(true);
    try {
      if (platform === 'facebook') {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl || shareText)}&quote=${encodeURIComponent(`${product.name} · ${formatPrice(product.price)}`)}`;
        await Linking.openURL(facebookUrl);
        setVisible(false);
        return;
      }
      if (platform === 'x') {
        const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${product.name} · ${formatPrice(product.price)}`)}${shareUrl ? `&url=${encodeURIComponent(shareUrl)}` : ''}`;
        await Linking.openURL(xUrl);
        setVisible(false);
        return;
      }

      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && typeof navigator.share !== 'function') {
        setErrorMessage('Este navegador no ofrece el menú de compartir. Prueba desde un móvil o usa el botón Compartir del navegador.');
        return;
      }
      await Share.share({
        title: product.name,
        message: shareText,
        ...(shareUrl ? { url: shareUrl } : {}),
      }, { dialogTitle: 'Compartir producto' });
      setVisible(false);
    } catch {
      setErrorMessage('No se pudo abrir la opción para compartir. Inténtalo de nuevo.');
    } finally {
      setSharing(false);
    }
  };

  return <>
    <Pressable
      style={[styles.trigger, compact && styles.compactTrigger]}
      onPress={() => { setErrorMessage(''); setVisible(true); }}
      accessibilityRole="button"
      accessibilityLabel={`Compartir ${product.name}`}
      hitSlop={6}
    >
      <Icon name="share-variant-outline" size={compact ? 16 : 19} color={colors.white} />
    </Pressable>
    <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
      <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleWrap}>
              <View style={styles.titleIcon}><Icon name="share-variant-outline" size={18} color={colors.background} /></View>
              <View style={styles.titleCopy}>
                <Text style={styles.title}>Compartir producto</Text>
                <Text style={styles.productName} numberOfLines={1}>{product.name} · {formatPrice(product.price)}</Text>
              </View>
            </View>
            <Pressable onPress={() => setVisible(false)} accessibilityRole="button" accessibilityLabel="Cerrar">
              <Icon name="close" size={21} color={colors.muted} />
            </Pressable>
          </View>
          <Text style={styles.description}>Elige dónde compartir este producto.</Text>
          <View style={styles.options}>
            {SOCIAL_OPTIONS.map((option) => <Pressable
              key={option.id}
              style={styles.option}
              onPress={() => share(option.id)}
              disabled={sharing}
              accessibilityRole="button"
              accessibilityLabel={`Compartir en ${option.label}`}
            >
              <View style={[styles.socialIcon, { backgroundColor: option.color }]}>{socialIcon(option.id)}</View>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Icon name="chevron-right" size={19} color={colors.muted} />
            </Pressable>)}
          </View>
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          <Text style={styles.note}>Instagram abre el menú de compartir del dispositivo. El enlace compartido usa la imagen pública del producto.</Text>
        </Pressable>
      </Pressable>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  trigger: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(9,7,15,0.78)', alignItems: 'center', justifyContent: 'center' },
  compactTrigger: { width: 29, height: 29 },
  overlay: { flex: 1, backgroundColor: 'rgba(4, 3, 9, 0.78)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  sheet: { width: '100%', maxWidth: 420, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 22, padding: 19 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sheetTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1 },
  titleIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  titleCopy: { flex: 1 },
  title: { color: colors.white, fontSize: 15, fontWeight: '900' },
  productName: { color: colors.muted, fontSize: 10, marginTop: 4 },
  description: { color: colors.muted, fontSize: 12, marginTop: 15, marginBottom: 7 },
  options: { gap: 8 },
  option: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 13, paddingHorizontal: 11 },
  socialIcon: { width: 33, height: 33, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  optionLabel: { flex: 1, color: colors.white, fontSize: 12, fontWeight: '800' },
  error: { color: colors.danger, fontSize: 11, lineHeight: 16, marginTop: 11 },
  note: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 13 },
});
