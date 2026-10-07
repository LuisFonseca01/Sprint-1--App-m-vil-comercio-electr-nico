import { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import ProductCard from '../components/ProductCard';
import CategoryPills from '../components/CategoryPills';
import BottomNav from '../components/BottomNav';
import { latest, offers, products as seedProducts } from '../data/products';
import { colors, shadow } from '../theme';

function Section({ title, action, children }) {
  return <View style={styles.section}><View style={styles.sectionHead}><Text style={styles.sectionTitle}>{title}</Text>{action && <Pressable style={styles.action}><Text style={styles.actionText}>{action}</Text><Icon name="arrow-right" size={14} color={colors.purpleBright} /></Pressable>}</View>{children}</View>;
}

function HorizontalProducts({ data, navigation, favorites, onToggleFavorite }) {
  return <FlatList horizontal data={data} keyExtractor={(item) => item.id} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalProducts} renderItem={({ item }) => <ProductCard product={item} compact isFavorite={favorites.some((favorite) => favorite.id === item.id)} onToggleFavorite={() => onToggleFavorite(item)} onPress={() => navigation.navigate('Product', { product: item })} />} />;
}

export default function HomeScreen({ navigation, cartCount, favorites = [], products = seedProducts, onToggleFavorite, user }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = products.filter((product) => (selectedCategory === 'all' || product.category === selectedCategory) && product.name.toLowerCase().includes(normalizedSearch));
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.fixedHeader}>
        <View style={styles.topBar}><View><Text style={styles.eyebrow}>BIENVENIDO A</Text><Text style={styles.brand}>game<Text style={styles.brandAccent}>cube</Text></Text></View><View style={styles.headerActions}>{user?.role === 'admin' && <Pressable style={styles.panelButton} onPress={() => navigation.navigate('AdminDashboard')} accessibilityLabel="Abrir panel administrador"><Icon name="dashboard" size={21} color={colors.lime} /></Pressable>}<Pressable style={styles.cartButton} onPress={() => navigation.navigate('Main', { screen: 'cart' })}><Icon name="cart-variant" size={24} />{cartCount > 0 && <View style={styles.cartBadge}><Text style={styles.badgeText}>{cartCount}</Text></View>}</Pressable></View></View>
        <View style={styles.search}><Icon name="magnify" size={23} color={colors.purpleBright} /><TextInput value={search} onChangeText={setSearch} placeholder="Busca tu próximo upgrade" placeholderTextColor={colors.muted} style={styles.searchInput} /><Pressable accessibilityLabel="Filtrar productos"><Icon name="tune-variant" size={21} color={colors.purpleBright} /></Pressable></View>
      </View>
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<View>
          <View style={styles.hero}><Image source={{ uri: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=1200&q=85' }} style={styles.heroImage} resizeMode="cover" /><View style={styles.heroOverlay} /><View style={styles.heroCopy}><Text style={styles.heroKicker}>LA NUEVA ERA GAMER</Text><Text style={styles.heroTitle}>Juega en otra{ '\n' }dimensión.</Text><Text style={styles.heroSubtitle}>Hardware sin límites para tu próxima partida.</Text><Pressable style={styles.heroButton} onPress={() => setSelectedCategory('gpu')}><Text style={styles.heroButtonText}>Ver novedades</Text><Icon name="arrow-right" size={16} color={colors.background} /></Pressable></View></View>
          <Section title="Categorías" action="Ver todas"><CategoryPills selected={selectedCategory} onSelect={setSelectedCategory} /></Section>
          {!search && selectedCategory === 'all' && <><Section title="Ofertas de la semana" action="Ver ofertas"><View style={styles.offerBanner}><View><Text style={styles.offerKicker}>HASTA -30%</Text><Text style={styles.offerTitle}>Sube de nivel{ '\n' }por menos.</Text><Text style={styles.offerText}>En productos seleccionados</Text></View><Icon name="sale" size={60} color={colors.pink} /></View><HorizontalProducts data={offers} navigation={navigation} favorites={favorites} onToggleFavorite={onToggleFavorite} /></Section><Section title="Lo más nuevo" action="Recién llegados"><HorizontalProducts data={latest} navigation={navigation} favorites={favorites} onToggleFavorite={onToggleFavorite} /></Section></>}
          <Section title={normalizedSearch ? 'Resultados de búsqueda' : selectedCategory === 'all' ? 'Más para tu setup' : 'Productos de la categoría'} action={`${filtered.length} productos`} />
        </View>}
        renderItem={({ item }) => <ProductCard product={item} isFavorite={favorites.some((favorite) => favorite.id === item.id)} onToggleFavorite={() => onToggleFavorite(item)} onPress={() => navigation.navigate('Product', { product: item })} />}
        ListEmptyComponent={<View style={styles.noResults}><Icon name="search-off" size={42} color={colors.purpleBright} /><Text style={styles.noResultsTitle}>Sin coincidencias</Text><Text style={styles.noResultsText}>No encontramos productos para “{search.trim()}”. Prueba con otro nombre o categoría.</Text></View>}
      />
      <BottomNav active="home" navigation={navigation} cartCount={cartCount} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 105 },
  fixedHeader: { backgroundColor: colors.background, paddingHorizontal: 18, zIndex: 20, elevation: 12, boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.3)' },
  topBar: { paddingTop: 12, paddingBottom: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  panelButton: { width: 45, height: 45, borderRadius: 15, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.lime },
  eyebrow: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  brand: { color: colors.white, fontSize: 31, fontWeight: '900', letterSpacing: -1.2 },
  brandAccent: { color: colors.purpleBright },
  cartButton: { width: 45, height: 45, borderRadius: 15, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  cartBadge: { position: 'absolute', top: -5, right: -5, width: 17, height: 17, borderRadius: 9, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.background, fontSize: 9, fontWeight: '900' },
  search: { height: 51, backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, marginBottom: 20 },
  searchInput: { flex: 1, color: colors.white, fontSize: 13, marginHorizontal: 10 },
  hero: { height: 216, borderRadius: 22, overflow: 'hidden', position: 'relative', marginBottom: 27, ...shadow },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(9, 7, 15, 0.66)' },
  heroCopy: { position: 'absolute', left: 21, top: 25 },
  heroKicker: { color: colors.lime, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  heroTitle: { color: colors.white, fontSize: 29, lineHeight: 31, fontWeight: '900', marginTop: 8 },
  heroSubtitle: { color: '#DED5EE', fontSize: 12, marginTop: 8 },
  heroButton: { alignSelf: 'flex-start', marginTop: 17, backgroundColor: colors.lime, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', gap: 7, alignItems: 'center' },
  heroButtonText: { color: colors.background, fontSize: 11, fontWeight: '900' },
  section: { marginBottom: 7 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  sectionTitle: { color: colors.white, fontSize: 18, fontWeight: '900' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { color: colors.purpleBright, fontSize: 11, fontWeight: '800' },
  offerBanner: { minHeight: 124, borderRadius: 17, backgroundColor: colors.violet, padding: 17, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' },
  offerKicker: { color: colors.lime, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  offerTitle: { color: colors.white, fontSize: 22, lineHeight: 24, fontWeight: '900', marginTop: 4 },
  offerText: { color: '#E7DAFF', fontSize: 10, marginTop: 6 },
  horizontalProducts: { gap: 12, paddingBottom: 22 },
  columns: { justifyContent: 'space-between', marginBottom: 15 },
  empty: { color: colors.muted, textAlign: 'center', padding: 30 },
  noResults: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 52 },
  noResultsTitle: { color: colors.white, fontSize: 18, fontWeight: '900', marginTop: 13 },
  noResultsText: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 7 },
});
