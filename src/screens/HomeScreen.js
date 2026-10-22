import { useState } from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import ProductCard from '../components/ProductCard';
import CategoryPills from '../components/CategoryPills';
import BottomNav from '../components/BottomNav';
import NotificationBell from '../components/NotificationBell';
import { offers, products as seedProducts } from '../data/products';
import { colors, shadow, createAdaptiveStyles } from '../theme';

function Section({ title, action, icon, children }) {
  return <View style={styles.section}><View style={styles.sectionHead}><View style={styles.sectionHeading}>{icon && <View style={styles.sectionIcon}><Icon name={icon} size={18} color={colors.ink} /></View>}<Text style={styles.sectionTitle}>{title}</Text></View>{action && <Pressable style={styles.action}><Text style={styles.actionText}>{action}</Text><Icon name="arrow-right" size={14} color={colors.purpleBright} /></Pressable>}</View>{children}</View>;
}

function HorizontalProducts({ data, navigation, favorites, onToggleFavorite }) {
  return <FlatList horizontal data={data} keyExtractor={(item) => item.id} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalProducts} renderItem={({ item }) => <ProductCard product={item} compact isFavorite={favorites.some((favorite) => favorite.id === item.id)} onToggleFavorite={() => onToggleFavorite(item)} onPress={() => navigation.navigate('Product', { product: item })} />} />;
}

export default function HomeScreen({ navigation, cartCount, favorites = [], products = seedProducts, onToggleFavorite, user, notifications = [], onNotificationsOpen, themeMode = 'dark', toggleTheme }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [draftMinPrice, setDraftMinPrice] = useState('');
  const [draftMaxPrice, setDraftMaxPrice] = useState('');
  const [draftSortBy, setDraftSortBy] = useState('relevance');
  const [draftMinRating, setDraftMinRating] = useState(0);
  const [filterError, setFilterError] = useState('');
  const newProducts = products.slice(-8);
  const normalizedSearch = search.trim().toLowerCase();
  const sortOptions = [
    { id: 'relevance', label: 'Más relevantes' },
    { id: 'priceAsc', label: 'Precio: menor a mayor' },
    { id: 'priceDesc', label: 'Precio: mayor a menor' },
    { id: 'rating', label: 'Mejor calificados' },
  ];
  const hasActiveFilters = Boolean(minPrice || maxPrice || minRating || sortBy !== 'relevance');
  const activeFilterCount = Number(Boolean(minPrice)) + Number(Boolean(maxPrice)) + Number(Boolean(minRating)) + Number(sortBy !== 'relevance');
  const filtered = products.filter((product) => {
    const searchableText = [product.name, product.shortName, product.categoryLabel, product.category, product.description, ...(product.specs || [])].filter(Boolean).join(' ').toLowerCase();
    const price = Number(product.price) || 0;
    const rating = Number(product.rating) || 0;
    return (selectedCategory === 'all' || product.category === selectedCategory)
      && (!normalizedSearch || searchableText.includes(normalizedSearch))
      && (!minPrice || price >= Number(minPrice))
      && (!maxPrice || price <= Number(maxPrice))
      && (!minRating || rating >= minRating);
  }).sort((a, b) => {
    if (sortBy === 'priceAsc') return Number(a.price) - Number(b.price);
    if (sortBy === 'priceDesc') return Number(b.price) - Number(a.price);
    if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    const relevance = (product) => {
      if (!normalizedSearch) return Number(product.rating) || 0;
      const name = `${product.name} ${product.shortName || ''}`.toLowerCase();
      const category = `${product.categoryLabel || ''} ${product.category || ''}`.toLowerCase();
      return (name.startsWith(normalizedSearch) ? 100 : name.includes(normalizedSearch) ? 50 : category.includes(normalizedSearch) ? 20 : 0) + (Number(product.rating) || 0);
    };
    return relevance(b) - relevance(a);
  });

  const openFilters = () => {
    setDraftMinPrice(minPrice);
    setDraftMaxPrice(maxPrice);
    setDraftMinRating(minRating);
    setDraftSortBy(sortBy);
    setFilterError('');
    setFiltersVisible(true);
  };
  const applyFilters = () => {
    const minimum = draftMinPrice.trim() ? Number(draftMinPrice) : null;
    const maximum = draftMaxPrice.trim() ? Number(draftMaxPrice) : null;
    if ((minimum !== null && (!Number.isFinite(minimum) || minimum < 0)) || (maximum !== null && (!Number.isFinite(maximum) || maximum < 0))) {
      setFilterError('Introduce precios válidos, iguales o mayores a $0.');
      return;
    }
    if (minimum !== null && maximum !== null && minimum > maximum) {
      setFilterError('El precio mínimo no puede ser mayor al precio máximo.');
      return;
    }
    setMinPrice(minimum === null ? '' : String(minimum));
    setMaxPrice(maximum === null ? '' : String(maximum));
    setMinRating(draftMinRating);
    setSortBy(draftSortBy);
    setFilterError('');
    setFiltersVisible(false);
  };
  const clearFilters = () => {
    setDraftMinPrice('');
    setDraftMaxPrice('');
    setDraftMinRating(0);
    setDraftSortBy('relevance');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    setSortBy('relevance');
    setFilterError('');
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.fixedHeader}>
        <View style={styles.topBar}><View><Text style={styles.eyebrow}>BIENVENIDO A</Text><Text style={styles.brand}>game<Text style={styles.brandAccent}>cube</Text></Text></View><View style={styles.headerActions}>{user?.role === 'admin' && <Pressable style={styles.panelButton} onPress={() => navigation.navigate('AdminDashboard')} accessibilityLabel="Abrir panel administrador"><Icon name="dashboard" size={21} color={colors.lime} /></Pressable>}<NotificationBell notifications={notifications} onOpen={onNotificationsOpen} /><Pressable style={styles.cartButton} onPress={toggleTheme} accessibilityRole="button" accessibilityLabel={themeMode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}><Icon name={themeMode === 'dark' ? 'light-mode' : 'dark-mode'} size={21} color={colors.purpleBright} /></Pressable><Pressable style={styles.cartButton} onPress={() => navigation.navigate('Main', { screen: 'cart' })} accessibilityLabel="Abrir carrito"><Icon name="cart-variant" size={24} />{cartCount > 0 && <View style={styles.cartBadge}><Text style={styles.badgeText}>{cartCount}</Text></View>}</Pressable></View></View>
        <View style={styles.search}><Icon name="magnify" size={23} color={colors.purpleBright} /><TextInput value={search} onChangeText={setSearch} placeholder="Busca tu próximo upgrade" placeholderTextColor={colors.muted} style={styles.searchInput} /><Pressable onPress={openFilters} accessibilityRole="button" accessibilityLabel="Abrir filtros de búsqueda" style={styles.filterButton}><Icon name="tune-variant" size={21} color={activeFilterCount ? colors.lime : colors.purpleBright} />{activeFilterCount > 0 && <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{activeFilterCount}</Text></View>}</Pressable></View>
      </View>
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<View>
          <View style={styles.hero}><Image source={{ uri: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=1200&q=85' }} style={styles.heroImage} resizeMode="cover" /><View style={styles.heroOverlay} /><View style={styles.heroCopy}><Text style={styles.heroKicker}>LA NUEVA ERA GAMER</Text><Text style={styles.heroTitle}>Juega en otra{ '\n' }dimensión.</Text><Text style={styles.heroSubtitle}>Hardware sin límites para tu próxima partida.</Text><Pressable style={styles.heroButton} onPress={() => setSelectedCategory('gpu')}><Text style={styles.heroButtonText}>Ver novedades</Text><Icon name="arrow-right" size={16} color={colors.ink} /></Pressable></View></View>
          <Section title="Categorías" action="Ver todas"><CategoryPills selected={selectedCategory} onSelect={setSelectedCategory} /></Section>
          {!normalizedSearch && selectedCategory === 'all' && !hasActiveFilters && <><Section title="Ofertas de la semana" action="Ver ofertas"><View style={styles.offerBanner}><View><Text style={styles.offerKicker}>HASTA -30%</Text><Text style={styles.offerTitle}>Sube de nivel{ '\n' }por menos.</Text><Text style={styles.offerText}>En productos seleccionados</Text></View><Icon name="sale" size={60} color={colors.pink} /></View><HorizontalProducts data={offers} navigation={navigation} favorites={favorites} onToggleFavorite={onToggleFavorite} /></Section><Section title="Productos nuevos" action={`${newProducts.length} productos`} icon="new-releases"><HorizontalProducts data={newProducts} navigation={navigation} favorites={favorites} onToggleFavorite={onToggleFavorite} /></Section></>}
          <Section title={normalizedSearch || selectedCategory !== 'all' || hasActiveFilters ? 'Resultados de búsqueda' : 'Más para tu setup'} action={`${filtered.length} productos`} />
        </View>}
        renderItem={({ item }) => <ProductCard product={item} isFavorite={favorites.some((favorite) => favorite.id === item.id)} onToggleFavorite={() => onToggleFavorite(item)} onPress={() => navigation.navigate('Product', { product: item })} />}
        ListEmptyComponent={<View style={styles.noResults}><Icon name="search-off" size={42} color={colors.purpleBright} /><Text style={styles.noResultsTitle}>Sin coincidencias</Text><Text style={styles.noResultsText}>{normalizedSearch ? `No encontramos productos para “${search.trim()}”. Prueba con otro nombre o categoría.` : 'No hay productos con estos filtros. Amplía el rango de precio o baja la calificación mínima.'}</Text></View>}
      />
      <BottomNav active="home" navigation={navigation} cartCount={cartCount} />
      <Modal visible={filtersVisible} transparent animationType="fade" onRequestClose={() => setFiltersVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.filterSheet}>
            <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Filtrar productos</Text><Text style={styles.modalSubtitle}>Ajusta los resultados a tu búsqueda</Text></View><Pressable style={styles.closeButton} onPress={() => setFiltersVisible(false)} accessibilityLabel="Cerrar filtros"><Icon name="close" size={21} color={colors.white} /></Pressable></View>
            <Text style={styles.filterLabel}>Ordenar por</Text>
            <View style={styles.sortOptions}>{sortOptions.map((option) => <Pressable key={option.id} onPress={() => setDraftSortBy(option.id)} style={[styles.sortOption, draftSortBy === option.id && styles.sortOptionActive]}><Text style={[styles.sortOptionText, draftSortBy === option.id && styles.sortOptionTextActive]}>{option.label}</Text>{draftSortBy === option.id && <Icon name="check" size={17} color={colors.lime} />}</Pressable>)}</View>
            <Text style={styles.filterLabel}>Rango de precio</Text>
            <View style={styles.priceInputs}><View style={styles.priceInputWrap}><Text style={styles.inputLabel}>Mínimo</Text><TextInput value={draftMinPrice} onChangeText={setDraftMinPrice} placeholder="$0" placeholderTextColor={colors.muted} keyboardType="numeric" style={styles.priceInput} accessibilityLabel="Precio mínimo" /></View><Text style={styles.priceSeparator}>—</Text><View style={styles.priceInputWrap}><Text style={styles.inputLabel}>Máximo</Text><TextInput value={draftMaxPrice} onChangeText={setDraftMaxPrice} placeholder="Sin límite" placeholderTextColor={colors.muted} keyboardType="numeric" style={styles.priceInput} accessibilityLabel="Precio máximo" /></View></View>
            <Text style={styles.filterLabel}>Calificación mínima</Text>
            <View style={styles.ratingOptions}>{[0, 3, 4].map((rating) => <Pressable key={rating} onPress={() => setDraftMinRating(rating)} style={[styles.ratingOption, draftMinRating === rating && styles.ratingOptionActive]}><Text style={[styles.ratingOptionText, draftMinRating === rating && styles.ratingOptionTextActive]}>{rating === 0 ? 'Todas' : `${rating}+`}</Text>{rating > 0 && <Icon name="star" size={13} color={draftMinRating === rating ? colors.ink : colors.lime} />}</Pressable>)}</View>
            {filterError ? <Text style={styles.filterError}>{filterError}</Text> : null}
            <View style={styles.modalActions}><Pressable style={styles.clearButton} onPress={clearFilters}><Text style={styles.clearButtonText}>Limpiar</Text></Pressable><Pressable style={styles.applyButton} onPress={applyFilters}><Text style={styles.applyButtonText}>Aplicar filtros</Text></Pressable></View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = createAdaptiveStyles({
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
  badgeText: { color: colors.ink, fontSize: 9, fontWeight: '900' },
  search: { height: 51, backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, marginBottom: 20 },
  searchInput: { flex: 1, color: colors.white, fontSize: 13, marginHorizontal: 10 },
  filterButton: { width: 36, height: 38, alignItems: 'center', justifyContent: 'center' },
  filterBadge: { position: 'absolute', top: 1, right: 0, width: 15, height: 15, borderRadius: 8, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { color: colors.ink, fontSize: 9, fontWeight: '900' },
  hero: { height: 216, borderRadius: 22, overflow: 'hidden', position: 'relative', marginBottom: 27, ...shadow },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(9, 7, 15, 0.66)' },
  heroCopy: { position: 'absolute', left: 21, top: 25 },
  heroKicker: { color: colors.lime, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  heroTitle: { color: colors.white, fontSize: 29, lineHeight: 31, fontWeight: '900', marginTop: 8 },
  heroSubtitle: { color: '#DED5EE', fontSize: 12, marginTop: 8 },
  heroButton: { alignSelf: 'flex-start', marginTop: 17, backgroundColor: colors.lime, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', gap: 7, alignItems: 'center' },
  heroButtonText: { color: colors.ink, fontSize: 11, fontWeight: '900' },
  section: { marginBottom: 7 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  sectionIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(4, 3, 9, 0.75)', justifyContent: 'center', padding: 18 },
  filterSheet: { width: '100%', maxWidth: 480, maxHeight: '90%', alignSelf: 'center', backgroundColor: colors.card, borderRadius: 21, borderWidth: 1, borderColor: colors.line, padding: 19 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: colors.white, fontSize: 20, fontWeight: '900' },
  modalSubtitle: { color: colors.muted, fontSize: 11, marginTop: 4 },
  closeButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  filterLabel: { color: colors.white, fontSize: 12, fontWeight: '900', marginTop: 12, marginBottom: 8 },
  sortOptions: { gap: 6 },
  sortOption: { minHeight: 39, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 11, borderRadius: 10, backgroundColor: colors.surface },
  sortOptionActive: { borderWidth: 1, borderColor: colors.lime },
  sortOptionText: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  sortOptionTextActive: { color: colors.white },
  priceInputs: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  priceInputWrap: { flex: 1 },
  inputLabel: { color: colors.muted, fontSize: 10, marginBottom: 5 },
  priceInput: { height: 43, borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, color: colors.white, paddingHorizontal: 11, fontSize: 12 },
  priceSeparator: { color: colors.muted, paddingBottom: 13 },
  ratingOptions: { flexDirection: 'row', gap: 8 },
  ratingOption: { minWidth: 72, height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  ratingOptionActive: { backgroundColor: colors.lime, borderColor: colors.lime },
  ratingOptionText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  ratingOptionTextActive: { color: colors.ink },
  filterError: { color: colors.danger, fontSize: 11, lineHeight: 16, marginTop: 10 },
  modalActions: { flexDirection: 'row', gap: 9, marginTop: 19 },
  clearButton: { minWidth: 92, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: colors.line },
  clearButtonText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  applyButton: { flex: 1, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.lime },
  applyButtonText: { color: colors.ink, fontSize: 12, fontWeight: '900' },
});
