import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { fetchTrendingMovies, getImageUrl } from '../../utils/api';

const { width, height } = Dimensions.get('window');
const SPACING = 15;
const ITEM_WIDTH = width * 0.75;
const GRID_ITEM_WIDTH = (width - SPACING * 3) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [trending, setTrending] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTrendingMovies();
        setTrending(data.slice(0, 5)); // Top 5 for hero carousel
        setRecommended(data.slice(5)); // Rest for the grid
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const renderHeader = () => (
    <Animated.View style={[
      styles.headerContainer,
      {
        backgroundColor: scrollY.interpolate({
          inputRange: [0, 50],
          outputRange: ['rgba(13, 13, 20, 0)', 'rgba(13, 13, 20, 0.9)'],
          extrapolate: 'clamp',
        })
      }
    ]}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greetingText}>Welcome back 👋</Text>
          <Text style={styles.headerTitle}>Discover</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderHeroCarouselItem = ({ item, index }: { item: any, index: number }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/movie/${item.id}` as any)}
        style={[
          styles.carouselItemContainer,
          { marginLeft: index === 0 ? SPACING : 0, marginRight: SPACING }
        ]}
      >
        <Image
          source={{ uri: getImageUrl(item.poster_path, 'w500') }}
          style={styles.carouselImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', '#0D0D14']}
          style={styles.carouselGradient}
        />
        <View style={styles.carouselContent}>
          <View style={styles.glassBadge}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.badgeText}>{item.vote_average?.toFixed(1)}</Text>
          </View>
          <Text style={styles.carouselTitle} numberOfLines={2}>
            {item.title || item.name}
          </Text>
          <Text style={styles.carouselSubtitle}>
            {item.release_date?.substring(0, 4)} • Trending #{index + 1}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGridItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.gridItemContainer}
        activeOpacity={0.8}
        onPress={() => router.push(`/movie/${item.id}` as any)}
      >
        <View style={styles.gridImageContainer}>
          <Image
            source={{ uri: getImageUrl(item.poster_path, 'w342') }}
            style={styles.gridImage}
          />
          <View style={styles.gridRatingBadge}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
            <Text style={styles.gridRatingText}>{item.vote_average?.toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.gridInfo}>
          <Text style={styles.gridTitle} numberOfLines={1}>{item.title || item.name}</Text>
          <Text style={styles.gridSubtitle} numberOfLines={1}>
            {item.overview || 'Action • Adventure'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.mainContainer, styles.center]}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      {renderHeader()}

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Carousel Section */}
        <Animated.FlatList
          data={trending}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHeroCarouselItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH + SPACING}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContainer}
        />

        {/* Grid Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridWrapper}>
          {recommended.map((item) => (
            <View key={item.id} style={{ width: GRID_ITEM_WIDTH }}>
              {renderGridItem({ item })}
            </View>
          ))}
        </View>

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0D0D14', // Deep cinematic black/blue
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING,
  },
  greetingText: {
    color: '#8A8A93',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E50914',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingTop: 110, // Give space for the absolute header
    paddingBottom: 120, // Extra padding for the floating tab bar
  },
  carouselContainer: {
    paddingVertical: 10,
  },
  carouselItemContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.3,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1A1A24',
    elevation: 10,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselGradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '60%',
  },
  carouselContent: {
    position: 'absolute',
    bottom: 0,
    padding: 20,
    width: '100%',
  },
  glassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 12,
  },
  carouselTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  carouselSubtitle: {
    fontSize: 14,
    color: '#EBEBF5',
    opacity: 0.8,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: SPACING,
    marginTop: 30,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#E50914',
    fontWeight: '600',
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING,
    justifyContent: 'space-between',
    gap: SPACING,
  },
  gridItemContainer: {
    marginBottom: 20,
  },
  gridImageContainer: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1A1A24',
    marginBottom: 10,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridRatingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gridRatingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    zIndex: 2,
  },
  gridInfo: {
    paddingHorizontal: 4,
  },
  gridTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  gridSubtitle: {
    color: '#8A8A93',
    fontSize: 12,
  },
});
