import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessageProvider, useMessage } from './src/components/MessageProvider';
import HomeScreen from './src/screens/HomeScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProductScreen from './src/screens/ProductScreen';
import LoginScreen from './src/screens/LoginScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AdminUsersScreen from './src/screens/AdminUsersScreen';
import AdminProductsScreen from './src/screens/AdminProductsScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import SupportChatScreen from './src/screens/SupportChatScreen';
import AdminOrdersScreen from './src/screens/AdminOrdersScreen';
import AdminSupportScreen from './src/screens/AdminSupportScreen';
import FaqScreen from './src/screens/FaqScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import { adminOrdersApi, authApi, cartApi, favoritesApi, ordersApi, productsApi, supportApi } from './src/api';

const Stack = createNativeStackNavigator();

function MainTabs({ route, navigation, cart, favorites, products, onRemove, onToggleFavorite, user, onLogout }) {
  const active = route.params?.screen || 'home';
  const shared = { navigation, cartCount: cart.length, favorites, products, user, onToggleFavorite };
  if (active === 'categories') return <CategoriesScreen {...shared} />;
  if (active === 'cart') return <CartScreen cart={cart} onRemove={onRemove} navigation={navigation} user={user} />;
  if (active === 'profile') return <ProfileScreen {...shared} user={user} onLogout={onLogout} />;
  if (active === 'favorites') return <FavoritesScreen {...shared} />;
  return <HomeScreen {...shared} />;
}

export default function App() {
  return <SafeAreaProvider><MessageProvider><AppContent /></MessageProvider></SafeAreaProvider>;
}

function AppContent() {
  const { showMessage } = useMessage();
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    productsApi.get().then((result) => {
      setProducts(result.products);
      if (result.offline) showMessage('Catálogo sin conexión', 'Mostramos productos guardados en este dispositivo. Los pedidos de una sesión local no se sincronizan con MongoDB.');
    }).catch((error) => showMessage('No se pudo cargar la tienda', error.message || 'Revisa tu conexión e inténtalo de nuevo.'));
    authApi.restore().then(async (session) => {
      if (session) {
        setUser(session.user);
        setToken(session.token);
        setCart((await cartApi.get(session.token)).cart);
        setFavorites((await favoritesApi.get(session.token)).favorites);
      }
    }).catch((error) => showMessage('No se pudo restaurar la sesión', error.message || 'Comprueba tu conexión e inténtalo de nuevo.')).finally(() => setReady(true));
  }, [showMessage]);

  const requireLogin = () => {
    showMessage('Inicia sesión', 'Necesitas una cuenta para añadir productos y comprar.', [{ text: 'Ahora no' }, { text: 'Iniciar sesión', onPress: () => navigationRef.navigate('Login') }]);
  };
  const addToCart = async (product) => {
    if (!user) return requireLogin();
    try { setCart((await cartApi.add(product, token)).cart); showMessage('Añadido al carrito', 'El producto está listo para tu compra.'); } catch (error) { showMessage('No se pudo añadir', error.message); }
  };
  const removeFromCart = async (index) => {
    try { setCart((await cartApi.remove(cart[index].id, token)).cart); } catch (error) { showMessage('No se pudo quitar el producto', error.message); }
  };
  const updateCartQuantity = async (productId, quantity) => {
    try { setCart((await cartApi.updateQuantity(productId, quantity, token)).cart); }
    catch (error) { showMessage('No se pudo actualizar el carrito', error.message); }
  };
  const completeCheckout = async (paymentMethod, last4, shippingAddress) => {
    const order = await ordersApi.simulateCheckout(cart, paymentMethod, last4, shippingAddress, user, token);
    setCart([]);
    return order;
  };
  const buyNow = async (product) => {
    if (!user) return requireLogin();
    try {
      setCart((await cartApi.add(product, token)).cart);
      navigationRef.navigate('Main', { screen: 'cart' });
    } catch (error) { showMessage('No se pudo abrir el producto', error.message); }
  };
  const toggleFavorite = async (product) => {
    try {
      const result = favorites.some((favorite) => favorite.id === product.id)
        ? await favoritesApi.remove(product.id, token)
        : await favoritesApi.add(product, token);
      setFavorites(result.favorites || []);
    } catch (error) { showMessage('No se pudo actualizar favoritos', error.message); }
  };
  const handleAuth = async (session) => {
    setUser(session.user);
    setToken(session.token);
    const [cartResult, favoritesResult] = await Promise.allSettled([
      cartApi.get(session.token),
      favoritesApi.get(session.token),
    ]);
    setCart(cartResult.status === 'fulfilled' ? cartResult.value.cart : []);
    setFavorites(favoritesResult.status === 'fulfilled' ? favoritesResult.value.favorites : []);
    if (cartResult.status === 'rejected') showMessage('No se pudo cargar el carrito', cartResult.reason.message || 'Revisa tu conexión e inténtalo de nuevo.');
    if (favoritesResult.status === 'rejected') showMessage('No se pudieron cargar tus favoritos', favoritesResult.reason.message || 'Revisa tu conexión e inténtalo de nuevo.');
    navigationRef.navigate('Main', { screen: 'home' });
    if (session.offline) showMessage('Sesión local de demostración', 'Tu cuenta y tus pedidos se guardan solo en este dispositivo; no se sincronizan con MongoDB.');
  };
  const logout = async () => { await authApi.logout(); setUser(null); setToken(null); setCart([]); setFavorites([]); };

  if (!ready) return null;
  return <NavigationContainer ref={(ref) => { navigationRef = ref; }}>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main">{(props) => <MainTabs {...props} cart={cart} favorites={favorites} products={products} onRemove={removeFromCart} onToggleFavorite={toggleFavorite} user={user} onLogout={logout} />}</Stack.Screen>
        <Stack.Screen name="Checkout">{(props) => <CheckoutScreen {...props} cart={cart} token={token} onUpdateQuantity={updateCartQuantity} onPaymentCompleted={completeCheckout} />}</Stack.Screen>
        <Stack.Screen name="Product">{(props) => <ProductScreen {...props} onAdd={addToCart} onBuyNow={buyNow} />}</Stack.Screen>
        <Stack.Screen name="Login">{(props) => <LoginScreen {...props} onAuth={handleAuth} />}</Stack.Screen>
        <Stack.Screen name="AdminDashboard">{(props) => <AdminDashboardScreen {...props} user={user} token={token} />}</Stack.Screen>
        <Stack.Screen name="AdminUsers">{(props) => <AdminUsersScreen {...props} token={token} />}</Stack.Screen>
        <Stack.Screen name="AdminProducts">{(props) => <AdminProductsScreen {...props} token={token} />}</Stack.Screen>
        <Stack.Screen name="OrderHistory">{(props) => <OrderHistoryScreen {...props} token={token} />}</Stack.Screen>
        <Stack.Screen name="SupportChat">{(props) => <SupportChatScreen {...props} token={token} user={user} />}</Stack.Screen>
        <Stack.Screen name="AdminOrders">{(props) => <AdminOrdersScreen {...props} token={token} />}</Stack.Screen>
        <Stack.Screen name="AdminSupport">{(props) => <AdminSupportScreen {...props} token={token} />}</Stack.Screen>
        <Stack.Screen name="Faq">{(props) => <FaqScreen {...props} />}</Stack.Screen>
        <Stack.Screen name="EditProfile">{(props) => <EditProfileScreen {...props} token={token} user={user} onUserUpdated={setUser} />}</Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>;
}

let navigationRef;
