import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import { categories, products as seedProducts } from '../data/products';
import { colors, shadow } from '../theme';

export default function CategoriesScreen({ navigation, cartCount, favorites = [], products = seedProducts, onToggleFavorite }) {
  const [selected, setSelected] = useState('all');
  const selectedCategory = categories.find((item) => item.id === selected);
  const shown = products.filter((item) => selected === 'all' || item.category === selected);
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>EXPLORA GAMECUBE</Text><Text style={styles.title}>Categorías</Text><Text style={styles.intro}>Encuentra la pieza exacta para el setup que tienes en mente.</Text>
        <View style={styles.categoryGrid}>{categories.filter((item) => item.id !== 'all').map((category) => <Pressable key={category.id} onPress={() => setSelected(category.id)} style={[styles.categoryTile, selected === category.id && styles.categoryTileActive]}><Icon name={category.icon} size={29} color={selected === category.id ? colors.background : colors.purpleBright} /><Text style={[styles.tileText, selected === category.id && styles.tileTextActive]}>{category.label}</Text><Text style={[styles.tileCount, selected === category.id && styles.tileTextActive]}>{products.filter((item) => item.category === category.id).length} productos</Text></Pressable>)}</View>
        <View style={styles.resultHeader}><View><Text style={styles.resultTitle}>{selectedCategory.label}</Text><Text style={styles.resultCount}>{shown.length} productos disponibles</Text></View><Pressable style={styles.filter}><Icon name="filter-variant" size={17} color={colors.purpleBright} /><Text style={styles.filterText}>Filtrar</Text></Pressable></View>
        <View style={styles.grid}>{shown.map((product) => <ProductCard key={product.id} product={product} isFavorite={favorites.some((favorite) => favorite.id === product.id)} onToggleFavorite={() => onToggleFavorite(product)} onPress={() => navigation.navigate('Product', { product })} />)}</View>
      </ScrollView>
      <BottomNav active="categories" navigation={navigation} cartCount={cartCount} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 105 },
  kicker: { color: colors.purpleBright, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginTop: 12 },
  title: { color: colors.white, fontSize: 32, fontWeight: '900', marginTop: 5 },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 23 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 11, marginBottom: 27 },
  categoryTile: { width: '48%', height: 121, borderRadius: 17, backgroundColor: colors.surface, padding: 16, justifyContent: 'space-between', borderWidth: 1, borderColor: colors.line, ...shadow },
  categoryTileActive: { backgroundColor: colors.lime, borderColor: colors.lime },
  tileText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  tileTextActive: { color: colors.background },
  tileCount: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  resultTitle: { color: colors.white, fontSize: 19, fontWeight: '900' },
  resultCount: { color: colors.muted, fontSize: 11, marginTop: 3 },
  filter: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.line },
  filterText: { color: colors.purpleBright, fontSize: 11, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 15 },
});
