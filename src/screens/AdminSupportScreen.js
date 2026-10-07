import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import Icon from '../components/Icon';
import { supportApi } from '../api';
import { colors } from '../theme';

function messageId(message) {
  return message.id || message._id || `${message.createdAt}-${message.text}`;
}

export default function AdminSupportScreen({ navigation, token }) {
  const [conversations, setConversations] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isFocused = useIsFocused();

  const load = useCallback(async () => {
    try {
      const result = await supportApi.getConversations(token);
      setConversations(result.conversations || []);
      setSelectedUserId((current) => current || result.conversations?.[0]?.userId || null);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'No se pudieron cargar las conversaciones.');
    }
  }, [token]);

  useEffect(() => {
    if (!isFocused) return undefined;
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load, isFocused]);

  const selected = conversations?.find((conversation) => conversation.userId === selectedUserId);

  const send = async () => {
    const text = draft.trim();
    if (!text || !selected || sending) return;
    setSending(true);
    setErrorMessage('');
    try {
      await supportApi.reply(selected.userId, text, token);
      setDraft('');
      await load();
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo enviar la respuesta.');
    } finally {
      setSending(false);
    }
  };

  return <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()}><Icon name="arrow-left" size={21} color={colors.white} /></Pressable>
        <View><Text style={styles.kicker}>ADMINISTRACIÓN</Text><Text style={styles.title}>Soporte</Text></View>
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {conversations === null ? <ActivityIndicator color={colors.lime} style={styles.loader} /> : conversations.length === 0 ? <View style={styles.empty}>
        <Icon name="chat" size={40} color={colors.purpleBright} />
        <Text style={styles.emptyText}>Aún no hay conversaciones.</Text>
      </View> : <>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.conversationPicker} contentContainerStyle={styles.conversationList}>
          {conversations.map((conversation) => <Pressable key={conversation.userId} style={[styles.conversation, selectedUserId === conversation.userId && styles.conversationSelected]} onPress={() => setSelectedUserId(conversation.userId)}>
            <Text style={styles.customerName} numberOfLines={1}>{conversation.customerName || 'Cliente'}</Text>
            <Text style={styles.preview} numberOfLines={1}>{conversation.lastMessage?.text || 'Sin mensajes'}</Text>
          </Pressable>)}
        </ScrollView>
        {selected && <>
          <View style={styles.customerHeader}>
            <Text style={styles.customerTitle}>{selected.customerName || 'Cliente'}</Text>
            {selected.customerEmail ? <Text style={styles.customerEmail}>{selected.customerEmail}</Text> : null}
          </View>
          <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
            {(selected.messages || []).map((message) => {
              const mine = message.senderRole === 'support';
              return <View key={messageId(message)} style={[styles.messageRow, mine ? styles.myRow : styles.userRow]}>
                <View style={[styles.bubble, mine ? styles.myBubble : styles.userBubble]}>
                  <Text style={styles.sender}>{mine ? 'Tú · Soporte' : (message.senderName || 'Cliente')}</Text>
                  <Text style={styles.messageText}>{message.text}</Text>
                  <Text style={styles.time}>{new Date(message.createdAt).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>;
            })}
          </ScrollView>
          <View style={styles.composer}>
            <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={send} placeholder="Responder..." placeholderTextColor={colors.muted} style={styles.input} multiline maxLength={1000} />
            <Pressable onPress={send} disabled={!draft.trim() || sending} style={[styles.send, (!draft.trim() || sending) && styles.sendDisabled]} accessibilityLabel="Enviar respuesta">
              <Icon name="send" size={20} color={colors.background} />
            </Pressable>
          </View>
        </>}
      </>}
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  header: { height: 74, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  back: { width: 39, height: 39, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  kicker: { color: colors.purpleBright, fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: colors.white, fontSize: 23, fontWeight: '900', marginTop: 3 },
  error: { color: colors.danger, fontSize: 11, padding: 12 },
  loader: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { color: colors.muted, fontSize: 12 },
  conversationPicker: { maxHeight: 74, borderBottomWidth: 1, borderBottomColor: colors.line },
  conversationList: { paddingHorizontal: 11, alignItems: 'center', gap: 8 },
  conversation: { width: 175, backgroundColor: colors.card, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 9 },
  conversationSelected: { borderColor: colors.lime },
  customerName: { color: colors.white, fontSize: 11, fontWeight: '900' },
  preview: { color: colors.muted, fontSize: 9, marginTop: 4 },
  customerHeader: { paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  customerTitle: { color: colors.white, fontSize: 12, fontWeight: '900' },
  customerEmail: { color: colors.muted, fontSize: 9, marginTop: 3 },
  messages: { flex: 1 },
  messagesContent: { padding: 13, gap: 10 },
  messageRow: { flexDirection: 'row' },
  myRow: { justifyContent: 'flex-end' },
  userRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '85%', borderRadius: 14, padding: 10 },
  myBubble: { backgroundColor: colors.violet, borderBottomRightRadius: 4 },
  userBubble: { backgroundColor: colors.card, borderBottomLeftRadius: 4 },
  sender: { color: colors.purpleBright, fontSize: 9, fontWeight: '900', marginBottom: 5 },
  messageText: { color: colors.white, fontSize: 12, lineHeight: 18 },
  time: { color: '#C1B8D0', fontSize: 8, textAlign: 'right', marginTop: 5 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: colors.line, padding: 11 },
  input: { flex: 1, maxHeight: 100, minHeight: 42, borderRadius: 13, backgroundColor: colors.surface, color: colors.white, paddingHorizontal: 12, paddingTop: 11, paddingBottom: 9, fontSize: 12 },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.5 },
});
