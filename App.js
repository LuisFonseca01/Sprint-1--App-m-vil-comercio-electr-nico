import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    productsApi.get().then((result) => setProducts(result.products)).catch(() => {});
    authApi.restore().then(async (session) => {
      if (session) {
        setUser(session.user);
        setToken(session.token);
        setCart((await cartApi.get(session.token)).cart);
        setFavorites((await favoritesApi.get(session.token)).favorites);
      }
    }).catch(() => {}).finally(() => setReady(true));
  }, []);

  const requireLogin = () => {
    Alert.alert('Inicia sesión', 'Necesitas una cuenta para añadir productos y comprar.', [{ text: 'Ahora no' }, { text: 'Iniciar sesión', onPress: () => navigationRef.navigate('Login') }]);
  };
  const addToCart = async (product) => {
    if (!user) return requireLogin();
    try { setCart((await cartApi.add(product, token)).cart); Alert.alert('Añadido', 'El producto está en tu carrito.'); } catch (error) { Alert.alert('Error', error.message); }
  };
  const removeFromCart = async (index) => {
    try { setCart((await cartApi.remove(cart[index].id, token)).cart); } catch (error) { Alert.alert('Error', error.message); }
  };
  const updateCartQuantity = async (productId, quantity) => {
    try { setCart((await cartApi.updateQuantity(productId, quantity, token)).cart); }
    catch (error) { Alert.alert('No se pudo actualizar el carrito', error.message); }
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
    } catch (error) { Alert.alert('Error', error.message); }
  };
  const toggleFavorite = async (product) => {
    try {
      const result = favorites.some((favorite) => favorite.id === product.id)
        ? await favoritesApi.remove(product.id, token)
        : await favoritesApi.add(product, token);
      setFavorites(result.favorites || []);
    } catch (error) { Alert.alert('Error', error.message); }
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
    navigationRef.navigate('Main', { screen: 'home' });
  };
  const logout = async () => { await authApi.logout(); setUser(null); setToken(null); setCart([]); setFavorites([]); };

  if (!ready) return null;
  return <SafeAreaProvider><NavigationContainer ref={(ref) => { navigationRef = ref; }}>
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
      </Stack.Navigator>
    </NavigationContainer></SafeAreaProvider>;
}

let navigationRef;
