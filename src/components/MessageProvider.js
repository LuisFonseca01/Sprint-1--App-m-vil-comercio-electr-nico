import { createContext, useContext, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';
import { colors } from '../theme';

const MessageContext = createContext(null);

export function MessageProvider({ children }) {
  const [message, setMessage] = useState(null);
  const value = useMemo(() => ({
    showMessage(title, text, buttons = [{ text: 'Entendido' }]) {
      setMessage({ title, text, buttons });
    },
  }), []);

  const close = (button) => {
    setMessage(null);
    button?.onPress?.();
  };

  return <MessageContext.Provider value={value}>
    {children}
    <Modal transparent visible={Boolean(message)} animationType="fade" onRequestClose={() => close()}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.icon}><Icon name="information-outline" size={24} color={colors.background} /></View>
          <Text style={styles.title}>{message?.title}</Text>
          <Text style={styles.text}>{message?.text}</Text>
          <View style={styles.actions}>
            {(message?.buttons || []).map((button, index) => <Pressable key={`${button.text}-${index}`} style={[styles.button, index === 0 && styles.secondaryButton, button.style === 'destructive' && styles.destructiveButton]} onPress={() => close(button)}>
              <Text style={[styles.buttonText, index === 0 && styles.secondaryText, button.style === 'destructive' && styles.destructiveText]}>{button.text}</Text>
            </Pressable>)}
          </View>
        </View>
      </View>
    </Modal>
  </MessageContext.Provider>;
}

export function useMessage() {
  const context = useContext(MessageContext);
  if (!context) throw new Error('useMessage debe usarse dentro de MessageProvider');
  return context;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(4, 3, 9, 0.78)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 22, padding: 22, alignItems: 'center' },
  icon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { color: colors.white, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  text: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 9 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 9, width: '100%', marginTop: 22 },
  button: { minWidth: 105, backgroundColor: colors.lime, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
  secondaryButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  destructiveButton: { backgroundColor: colors.danger },
  buttonText: { color: colors.background, fontSize: 12, fontWeight: '900' },
  secondaryText: { color: colors.white },
  destructiveText: { color: colors.white },
});
