import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import Icon from '../components/Icon';
import { supportApi } from '../api';
import { colors } from '../theme';

function messageId(message) {
  return message.id || message._id || `${message.createdAt}-${message.text}`;
}

export default function SupportChatScreen({ navigation, token, user }) {
  const [messages, setMessages] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const scrollRef = useRef(null);
  const isFocused = useIsFocused();

  const loadMessages = useCallback(async (quiet = false) => {
    try {
      const result = await supportApi.getMessages(token);
      setMessages(result.messages || []);
      setErrorMessage('');
    } catch (error) {
      if (!quiet) setErrorMessage(error.message || 'No se pudieron cargar los mensajes.');
    }
  }, [token]);

  useEffect(() => {
    if (!isFocused) return undefined;
    loadMessages();
    const interval = setInterval(() => loadMessages(true), 3000);
    return () => clearInterval(interval);
  }, [loadMessages, isFocused]);

  useEffect(() => { scrollRef.current?.scrollToEnd({ animated: true }); }, [messages?.length]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setErrorMessage('');
    try {
      await supportApi.sendMessage(text, token, user);
      setDraft('');
      await loadMessages();
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  return <SafeAreaView style={styles.safeArea}>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={10}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()}><Icon name="arrow-left" size={21} color={colors.white} /></Pressable>
        <View style={styles.supportAvatar}><Icon name="lifebuoy" size={21} color={colors.background} /></View>
        <View style={styles.headerInfo}><Text style={styles.title}>Soporte Gamecube</Text><View style={styles.presence}><View style={styles.onlineDot} /><Text style={styles.subtitle}>En línea · actualización automática</Text></View></View>
      </View>
      <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesContent} keyboardShouldPersistTaps="handled">
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>¿En qué podemos ayudarte?</Text>
          <Text style={styles.welcomeText}>Escribe tu consulta y el equipo de soporte te responderá aquí.</Text>
        </View>
        {messages === null ? <ActivityIndicator color={colors.lime} style={styles.loader} /> : messages.map((message) => {
          const mine = message.senderRole === 'customer';
          return <View key={messageId(message)} style={[styles.messageRow, mine ? styles.myRow : styles.supportRow]}>
            {!mine && <View style={styles.smallAvatar}><Icon name="lifebuoy" size={14} color={colors.white} /></View>}
            <View style={[styles.bubble, mine ? styles.myBubble : styles.supportBubble]}>
              {!mine && <Text style={styles.sender}>{message.senderName || 'Soporte Gamecube'}</Text>}
              <Text style={styles.messageText}>{message.text}</Text>
              <Text style={styles.time}>{new Date(message.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>;
        })}
      </ScrollView>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <View style={styles.composer}>
        <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={send} placeholder="Escribe un mensaje..." placeholderTextColor={colors.muted} style={styles.input} multiline maxLength={1000} />
        <Pressable onPress={send} disabled={!draft.trim() || sending} style={[styles.send, (!draft.trim() || sending) && styles.sendDisabled]} accessibilityLabel="Enviar mensaje">
          <Icon name="send" size={20} color={colors.background} />
        </Pressable>
      </View>
      <Text style={styles.privacy}>No compartas contraseñas ni datos completos de tarjetas.</Text>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  header: { height: 76, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 11 },
  back: { padding: 5 },
  supportAvatar: { width: 39, height: 39, borderRadius: 20, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  title: { color: colors.white, fontSize: 14, fontWeight: '900' },
  presence: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  subtitle: { color: colors.muted, fontSize: 10 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.lime, marginRight: 5 },
  messages: { flex: 1 },
  messagesContent: { padding: 14, paddingBottom: 22, flexGrow: 1 },
  welcome: { alignSelf: 'center', backgroundColor: colors.surface, borderRadius: 13, padding: 14, marginBottom: 20, maxWidth: 280 },
  welcomeTitle: { color: colors.white, fontSize: 12, fontWeight: '900', textAlign: 'center' },
  welcomeText: { color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 5 },
  loader: { marginTop: 25 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 7 },
  myRow: { justifyContent: 'flex-end' },
  supportRow: { justifyContent: 'flex-start' },
  smallAvatar: { width: 25, height: 25, borderRadius: 13, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 12, paddingTop: 9, paddingBottom: 7 },
  myBubble: { backgroundColor: colors.violet, borderBottomRightRadius: 4 },
  supportBubble: { backgroundColor: colors.card, borderBottomLeftRadius: 4 },
  sender: { color: colors.purpleBright, fontSize: 9, fontWeight: '900', marginBottom: 4 },
  messageText: { color: colors.white, fontSize: 12, lineHeight: 18 },
  time: { color: '#C1B8D0', fontSize: 8, alignSelf: 'flex-end', marginTop: 5 },
  error: { color: colors.danger, fontSize: 11, paddingHorizontal: 14, paddingBottom: 7 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: colors.line, padding: 12 },
  input: { flex: 1, maxHeight: 100, minHeight: 43, borderRadius: 14, backgroundColor: colors.surface, color: colors.white, paddingHorizontal: 13, paddingTop: 12, paddingBottom: 10, fontSize: 12 },
  send: { width: 43, height: 43, borderRadius: 22, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.5 },
  privacy: { color: colors.muted, fontSize: 9, textAlign: 'center', paddingBottom: 8 },
});
