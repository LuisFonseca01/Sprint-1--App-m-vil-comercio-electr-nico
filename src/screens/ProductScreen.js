import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import ProductShareButton from '../components/ProductShareButton';
import { productReviewsApi } from '../api';
import { colors, createAdaptiveStyles, formatPrice } from '../theme';

export default function ProductScreen({ route, navigation, onAdd, onBuyNow, onSubmitReview, token, user }) {
  const { product } = route.params;
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState(product.reviews || []);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewError, setReviewError] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewLoadError, setReviewLoadError] = useState('');

  useEffect(() => {
    let active = true;
    productReviewsApi.get(product.id, token).then((result) => {
      if (active) setReviews(result.offline && !result.reviews?.length ? product.reviews || [] : result.reviews || []);
    }).catch((error) => {
      if (active) setReviewLoadError(error.message || 'No se pudieron cargar las reseñas.');
    });
    return () => { active = false; };
  }, [product.id, token]);

  const averageRating = useMemo(() => reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : 0, [reviews]);

  const submitReview = async () => {
    if (!user) {
      setReviewError(true);
      setReviewMessage('Inicia sesión para compartir tu opinión.');
      onSubmitReview(product, { rating: selectedRating, text: reviewText });
      return;
    }
    setSubmittingReview(true);
    setReviewMessage('');
    setReviewError(false);
    try {
      const result = await onSubmitReview(product, { rating: selectedRating, text: reviewText });
      if (!result) return;
      setReviews(result.reviews || [result.review, ...reviews]);
      setReviewText('');
      setReviewMessage(result.offline ? 'Reseña guardada en este dispositivo.' : '¡Gracias! Tu reseña se guardó correctamente.');
    } catch (error) {
      setReviewError(true);
      setReviewMessage(error.message || 'No se pudo guardar tu reseña. Inténtalo de nuevo.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()} accessibilityLabel="Volver"><Icon name="arrow-left" size={21} /></Pressable>
        <Text style={styles.headerTitle}>Producto</Text>
        <ProductShareButton product={product} />
      </View>
      <Image source={{ uri: product.gallery[activeImage] }} style={styles.mainImage} resizeMode="cover" />
      <View style={styles.gallery}>{product.gallery.map((image, index) => <Pressable key={image} onPress={() => setActiveImage(index)} style={[styles.thumb, index === activeImage && styles.activeThumb]}><Image source={{ uri: image }} style={styles.thumbImage} resizeMode="cover" /></Pressable>)}</View>
      <Text style={styles.category}>{product.categoryLabel.toUpperCase()}</Text>
      <Text style={styles.title}>{product.name}</Text>
      <View style={styles.rating}>
        <View style={styles.stars}>{[1, 2, 3, 4, 5].map((star) => <Icon key={star} name={averageRating >= star ? 'star' : 'star-border'} size={15} color={colors.lime} />)}</View>
        <Text style={styles.ratingText}>{reviews.length ? `${averageRating.toFixed(1)} · ${reviews.length} ${reviews.length === 1 ? 'reseña' : 'reseñas'}` : 'Sin reseñas'}</Text>
        <Text style={styles.stock}>EN STOCK</Text>
      </View>
      <View style={styles.priceRow}><Text style={styles.price}>{formatPrice(product.price)}</Text>{product.oldPrice && <Text style={styles.oldPrice}>{formatPrice(product.oldPrice)}</Text>}</View>
      <Text style={styles.installments}>6 cuotas sin interés con tarjetas seleccionadas</Text>
      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Descripción</Text>
      <Text style={styles.description}>{product.description}</Text>
      <View style={styles.specs}>{product.specs.map((spec) => <View style={styles.spec} key={spec}><Icon name="check-circle-outline" size={17} color={colors.purpleBright} /><Text style={styles.specText}>{spec}</Text></View>)}</View>
      <View style={styles.delivery}><Icon name="truck-fast-outline" size={24} color={colors.lime} /><View><Text style={styles.deliveryTitle}>Envío gratis</Text><Text style={styles.deliveryText}>Recíbelo mañana en tu domicilio</Text></View></View>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Reseñas de clientes</Text>
      <View style={styles.reviewForm}>
        <Text style={styles.formLabel}>Tu calificación</Text>
        <View style={styles.ratingPicker}>{[1, 2, 3, 4, 5].map((star) => <Pressable key={star} onPress={() => setSelectedRating(star)} accessibilityRole="button" accessibilityLabel={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}><Icon name={selectedRating >= star ? 'star' : 'star-border'} size={30} color={colors.lime} /></Pressable>)}</View>
        <TextInput value={reviewText} onChangeText={setReviewText} style={styles.reviewInput} placeholder="Cuéntanos qué te pareció este producto" placeholderTextColor={colors.muted} multiline maxLength={1000} textAlignVertical="top" />
        <Text style={styles.characterCount}>{reviewText.length}/1000</Text>
        {reviewMessage ? <Text style={[styles.reviewMessage, reviewError && styles.reviewError]}>{reviewMessage}</Text> : null}
        <Pressable style={[styles.submitReview, submittingReview && styles.disabledButton]} onPress={submitReview} disabled={submittingReview}>
          <Text style={styles.submitReviewText}>{submittingReview ? 'Guardando…' : 'Publicar reseña'}</Text>
        </Pressable>
      </View>
      {reviewLoadError ? <Text style={styles.reviewError}>{reviewLoadError}</Text> : null}
      {reviews.length ? reviews.map((review) => <View style={styles.reviewCard} key={review._id || review.authorId || `${review.userName}-${review.createdAt}`}>
        <View style={styles.reviewHeader}><Text style={styles.reviewer}>{review.userName || 'Cliente'}</Text><Text style={styles.reviewDate}>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</Text></View>
        <View style={styles.reviewStars}>{[1, 2, 3, 4, 5].map((star) => <Icon key={star} name={Number(review.rating) >= star ? 'star' : 'star-border'} size={13} color={colors.lime} />)}</View>
        <Text style={styles.reviewBody}>{review.text}</Text>
      </View>) : <Text style={styles.emptyReviews}>Todavía no hay opiniones. ¡Sé la primera persona en reseñar este producto!</Text>}
    </ScrollView>
    <View style={styles.actions}>
      <Pressable style={styles.buy} onPress={() => onBuyNow(product)}><Text style={styles.buyText}>Comprar ahora</Text></Pressable>
      <Pressable style={styles.add} onPress={() => onAdd(product)} accessibilityLabel="Añadir al carrito"><Icon name="cart-plus" size={22} color={colors.ink} /></Pressable>
    </View>
  </SafeAreaView>;
}

const styles = createAdaptiveStyles({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 110 },
  header: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: colors.white, fontSize: 14, fontWeight: '900' },
  back: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  mainImage: { width: '100%', height: 300, borderRadius: 21, backgroundColor: colors.surface },
  gallery: { flexDirection: 'row', gap: 10, marginVertical: 17 },
  thumb: { width: 63, height: 63, borderRadius: 11, opacity: 0.5, overflow: 'hidden' },
  activeThumb: { opacity: 1, borderWidth: 2, borderColor: colors.lime },
  thumbImage: { width: '100%', height: '100%' },
  category: { color: colors.purpleBright, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 7 },
  title: { color: colors.white, fontSize: 27, lineHeight: 31, fontWeight: '900' },
  rating: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  stars: { flexDirection: 'row' },
  ratingText: { color: colors.muted, fontSize: 12, marginLeft: 5 },
  stock: { color: colors.lime, fontSize: 10, fontWeight: '900', marginLeft: 'auto' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18 },
  price: { color: colors.white, fontSize: 31, fontWeight: '900' },
  oldPrice: { color: colors.muted, textDecorationLine: 'line-through', fontSize: 13 },
  installments: { color: colors.purpleBright, fontSize: 11, marginTop: 3 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 22 },
  sectionTitle: { color: colors.white, fontSize: 17, fontWeight: '900', marginBottom: 8 },
  description: { color: colors.muted, fontSize: 13, lineHeight: 21 },
  specs: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 18 },
  spec: { width: '46%', flexDirection: 'row', alignItems: 'center', gap: 6 },
  specText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  delivery: { backgroundColor: colors.surface, borderRadius: 15, padding: 14, marginTop: 22, flexDirection: 'row', gap: 11, alignItems: 'center' },
  deliveryTitle: { color: colors.white, fontSize: 12, fontWeight: '900' },
  deliveryText: { color: colors.muted, fontSize: 11, marginTop: 3 },
  reviewForm: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 14, marginTop: 8 },
  formLabel: { color: colors.white, fontSize: 12, fontWeight: '800' },
  ratingPicker: { flexDirection: 'row', gap: 5, marginTop: 8 },
  reviewInput: { minHeight: 95, borderRadius: 11, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.background, color: colors.white, padding: 11, marginTop: 10, fontSize: 12 },
  characterCount: { color: colors.muted, fontSize: 10, textAlign: 'right', marginTop: 5 },
  reviewMessage: { color: colors.lime, fontSize: 11, marginTop: 8 },
  reviewError: { color: colors.danger, fontSize: 11, marginTop: 8 },
  submitReview: { backgroundColor: colors.lime, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  disabledButton: { opacity: 0.6 },
  submitReviewText: { color: colors.ink, fontSize: 12, fontWeight: '900' },
  reviewCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 13, padding: 13, marginTop: 10 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewer: { color: colors.white, fontSize: 12, fontWeight: '900' },
  reviewDate: { color: colors.muted, fontSize: 10 },
  reviewStars: { flexDirection: 'row', marginTop: 5 },
  reviewBody: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  emptyReviews: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 10, marginBottom: 8 },
  actions: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, flexDirection: 'row', gap: 10, backgroundColor: '#100C1A', borderTopWidth: 1, borderTopColor: colors.line },
  buy: { flex: 1, height: 51, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lime },
  buyText: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  add: { width: 54, height: 51, borderRadius: 14, backgroundColor: colors.purpleBright, alignItems: 'center', justifyContent: 'center' },
});
