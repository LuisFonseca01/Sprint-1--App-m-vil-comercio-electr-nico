import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import Icon from '../components/Icon';
import { colors } from '../theme';

export default function FavoritesScreen({ navigation, cartCount, favorites = [], onToggleFavorite }) {
  return <SafeAreaView style={styles.safeArea}>
    <FlatList data={favorites} numColumns={2} keyExtractor={(item) => item.id} columnWrapperStyle={styles.columns} contentContainerStyle={styles.content} ListHeaderComponent={<><Text style={styles.kicker}>TU COLECCIÓN</Text><Text style={styles.title}>Favoritos</Text><Text style={styles.intro}>{favorites.length ? `${favorites.length} productos guardados para después.` : 'Guarda productos desde el catálogo para encontrarlos aquí.'}</Text></>} renderItem={({ item }) => <ProductCard product={item} isFavorite onToggleFavorite={() => onToggleFavorite(item)} onPress={() => navigation.navigate('Product', { product: item })} />} ListEmptyComponent={<View style={styles.empty}><Icon name="heart-outline" size={48} color={colors.purpleBright} /><Text style={styles.emptyTitle}>Todavía no tienes favoritos</Text><Text style={styles.emptyText}>Toca el corazón de cualquier producto para crear tu lista.</Text></View>} />
    <BottomNav active="favorites" navigation={navigation} cartCount={cartCount} />
  </SafeAreaView>;
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: colors.background }, content: { padding: 18, paddingBottom: 105 }, kicker: { color: colors.purpleBright, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginTop: 12 }, title: { color: colors.white, fontSize: 32, fontWeight: '900', marginTop: 5 }, intro: { color: colors.muted, fontSize: 14, marginTop: 8, marginBottom: 23 }, columns: { justifyContent: 'space-between', marginBottom: 15 }, empty: { alignItems: 'center', paddingHorizontal: 28, paddingVertical: 80 }, emptyTitle: { color: colors.white, fontSize: 18, fontWeight: '900', marginTop: 14 }, emptyText: { color: colors.muted, textAlign: 'center', lineHeight: 20, marginTop: 7 } });
