import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';
import { colors, formatPrice, shadow } from '../theme';

export default function ProductCard({ product, onPress, compact = false, isFavorite = false, onToggleFavorite }) {
  return (
    <Pressable style={[styles.card, compact && styles.compactCard]} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        <Pressable style={styles.heart} onPress={onToggleFavorite} accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}><Icon name={isFavorite ? 'heart' : 'heart-outline'} size={17} color={isFavorite ? colors.pink : colors.white} /></Pressable>
        {product.oldPrice && <Text style={styles.offer}>OFERTA</Text>}
      </View>
      <Text style={styles.category}>{product.categoryLabel.toUpperCase()}</Text>
      <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
      <View style={styles.rating}><Icon name="star" size={13} color={colors.lime} /><Text style={styles.ratingText}>{product.rating}</Text><Text style={styles.shipping}> Envío gratis</Text></View>
      <View style={styles.priceRow}><View><Text style={styles.price}>{formatPrice(product.price)}</Text>{product.oldPrice && <Text style={styles.oldPrice}>{formatPrice(product.oldPrice)}</Text>}</View><View style={styles.add}><Icon name="plus" size={17} color={colors.background} /></View></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: '48%', backgroundColor: colors.card, borderRadius: 18, padding: 10, ...shadow },
  compactCard: { width: 164 },
  imageWrap: { height: 135, borderRadius: 13, overflow: 'hidden', backgroundColor: colors.surfaceLight, position: 'relative', marginBottom: 11 },
  image: { width: '100%', height: '100%' },
  heart: { position: 'absolute', right: 8, top: 8, width: 29, height: 29, borderRadius: 15, backgroundColor: 'rgba(9,7,15,0.75)', alignItems: 'center', justifyContent: 'center' },
  offer: { position: 'absolute', left: 7, bottom: 7, color: colors.background, fontSize: 8, fontWeight: '900', backgroundColor: colors.lime, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 5 },
  category: { color: colors.purpleBright, fontSize: 8, fontWeight: '900', letterSpacing: 0.8, marginBottom: 5 },
  name: { color: colors.white, fontSize: 13, lineHeight: 17, fontWeight: '800', minHeight: 34 },
  rating: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },
  ratingText: { color: colors.white, fontSize: 10, fontWeight: '800', marginLeft: 4 },
  shipping: { color: colors.muted, fontSize: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  price: { color: colors.white, fontSize: 19, fontWeight: '900' },
  oldPrice: { color: colors.muted, fontSize: 10, textDecorationLine: 'line-through', marginTop: 1 },
  add: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
});
