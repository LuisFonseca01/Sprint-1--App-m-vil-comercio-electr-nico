import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import Icon from './Icon';
import { categories } from '../data/products';
import { colors } from '../theme';

export default function CategoryPills({ selected, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
      {categories.map((item) => (
        <Pressable key={item.id} onPress={() => onSelect(item.id)} style={[styles.pill, selected === item.id && styles.active]}>
          <Icon name={item.icon} size={17} color={selected === item.id ? colors.background : colors.purpleBright} />
          <Text style={[styles.text, selected === item.id && styles.activeText]}>{item.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { gap: 9, paddingBottom: 22 },
  pill: { height: 42, paddingHorizontal: 14, borderRadius: 21, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: colors.line },
  active: { backgroundColor: colors.lime, borderColor: colors.lime },
  text: { color: colors.white, fontSize: 11, fontWeight: '800' },
  activeText: { color: colors.background },
});
