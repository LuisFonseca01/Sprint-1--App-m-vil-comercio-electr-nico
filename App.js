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
import { authApi, cartApi, favoritesApi, ordersApi } from './src/api';

const Stack = createNativeStackNavigator();

function MainTabs({ route, navigation, cart, favorites, onRemove, onCheckout, onToggleFavorite, user, onLogout }) {
  const active = route.params?.screen || 'home';
  const shared = { navigation, cartCount: cart.length, favorites, onToggleFavorite };
  if (active === 'categories') return <CategoriesScreen {...shared} />;
  if (active === 'cart') return <CartScreen cart={cart} onRemove={onRemove} onCheckout={onCheckout} navigation={navigation} user={user} />;
  if (active === 'profile') return <ProfileScreen {...shared} user={user} onLogout={onLogout} />;
  return <HomeScreen {...shared} />;
}

export default function App() {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
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
  const checkout = async () => { const result = await cartApi.checkout(token); setCart([]); return result; };
  const buyNow = async (product) => {
    if (!user) return requireLogin();
    try {
      await ordersApi.buyNow(product, token);
      Alert.alert('Compra realizada', 'El pedido se ha creado correctamente.');
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
    navigationRef.navigate('Main', { screen: 'profile' });
  };
  const logout = async () => { await authApi.logout(); setUser(null); setToken(null); setCart([]); setFavorites([]); };

  if (!ready) return null;
  return <SafeAreaProvider><NavigationContainer ref={(ref) => { navigationRef = ref; }}>
    <StatusBar style="light" />
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main">{(props) => <MainTabs {...props} cart={cart} favorites={favorites} onRemove={removeFromCart} onCheckout={checkout} onToggleFavorite={toggleFavorite} user={user} onLogout={logout} />}</Stack.Screen>
      <Stack.Screen name="Product">{(props) => <ProductScreen {...props} onAdd={addToCart} onBuyNow={buyNow} />}</Stack.Screen>
      <Stack.Screen name="Login">{(props) => <LoginScreen {...props} onAuth={handleAuth} />}</Stack.Screen>
    </Stack.Navigator>
  </NavigationContainer></SafeAreaProvider>;
}

let navigationRef;
