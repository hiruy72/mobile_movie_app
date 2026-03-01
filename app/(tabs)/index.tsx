import { useUser } from '@clerk/clerk-expo';
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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { fetchMoviesByMood, fetchTrendingAll, fetchTrendingMovies, fetchTrendingTV, getImageUrl } from '../../utils/api';
import { syncUserToDB } from '../../utils/userService';

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
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const filters = ['All', 'Movies', 'TV Series'];

  const moods = [
    { label: 'Happy', emoji: '😊', genres: [35, 10751] }, // Comedy, Family
    { label: 'Sad', emoji: '😢', genres: [18] }, // Drama
    { label: 'Broken', emoji: '💔', genres: [10749, 18] }, // Romance, Drama
    { label: 'Excited', emoji: '🔥', genres: [28, 12] }, // Action, Adventure
    { label: 'Bored', emoji: '🥱', genres: [53, 9648] }, // Thriller, Mystery
    { label: 'Spooky', emoji: '👻', genres: [27] }, // Horror
  ];

  const { user } = useUser();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let data = [];

        if (selectedMood) {
          const moodObj = moods.find(m => m.label === selectedMood);
          data = await fetchMoviesByMood(moodObj?.genres || []);
        } else {
          if (activeFilter === 'All') {
            data = await fetchTrendingAll();
          } else if (activeFilter === 'Movies') {
            data = await fetchTrendingMovies();
          } else {
            data = await fetchTrendingTV();
          }
        }

        setTrending(data.slice(0, 5)); // Top 5 for hero carousel
        setRecommended(data.slice(5)); // Rest for the grid

        if (user) {
          syncUserToDB(user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, activeFilter, selectedMood]);

  const handleFilterChange = (filter: string) => {
    setSelectedMood(null); // Reset mood when switching main filters
    setActiveFilter(filter);
  };

  const handleMoodChange = (mood: string) => {
    if (selectedMood === mood) {
      setSelectedMood(null); // Deselect if clicking the same mood
    } else {
      setSelectedMood(mood);
    }
  };

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
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/profile/edit')}
        >
          <Image
            source={{ uri: user?.imageUrl || 'https://i.pravatar.cc/150?img=11' }}
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
        {/* Filter Section */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {filters.map((filter) => {
              const isActive = !selectedMood && activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => handleFilterChange(filter)}
                  style={styles.filterTouchable}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.filterButton,
                    isActive && styles.activeFilterButton
                  ]}>
                    {isActive && <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />}
                    <Text style={[
                      styles.filterText,
                      isActive && styles.activeFilterText
                    ]}>
                      {filter}
                    </Text>
                  </View>
                  {isActive && <View style={styles.filterIndicator} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Mood Suggest Section */}
        <View style={styles.moodSection}>
          <View style={styles.moodHeader}>
            <Text style={styles.moodTitle}>How are you feeling?</Text>
            <View style={styles.moodDot} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodScroll}>
            {moods.map((mood) => {
              const isSelected = selectedMood === mood.label;
              return (
                <TouchableOpacity
                  key={mood.label}
                  onPress={() => handleMoodChange(mood.label)}
                  style={styles.moodTouchable}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isSelected ? ['#E50914', '#9B060D'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                    style={styles.moodCard}
                  >
                    <View style={styles.moodIconContainer}>
                      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                      {isSelected && <View style={styles.moodGlow} />}
                    </View>
                    <Text style={[
                      styles.moodLabel,
                      isSelected && styles.activeMoodLabel
                    ]}>
                      {mood.label}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

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
          <Text style={styles.sectionTitle}>
            {selectedMood ? `${selectedMood} Specials` : `Trending ${activeFilter}`}
          </Text>
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/see-all',
              params: {
                title: selectedMood ? `${selectedMood} Specials` : `Trending ${activeFilter}`,
                type: activeFilter,
                mood: selectedMood || ''
              }
            })}
          >
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
  filterContainer: {
    marginBottom: 20,
  },
  filterScroll: {
    paddingHorizontal: SPACING,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeFilterButton: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  filterText: {
    color: '#8A8A93',
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFF',
    fontWeight: '800',
  },
  filterTouchable: {
    marginRight: 12,
    alignItems: 'center',
  },
  filterIndicator: {
    width: 20,
    height: 3,
    backgroundColor: '#E50914',
    borderRadius: 2,
    marginTop: 6,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  moodSection: {
    marginBottom: 35,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING,
    marginBottom: 15,
  },
  moodTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  moodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E50914',
    marginLeft: 8,
  },
  moodScroll: {
    paddingHorizontal: SPACING,
    paddingBottom: 10,
  },
  moodTouchable: {
    marginRight: 15,
  },
  moodCard: {
    width: 100,
    height: 120,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 10,
  },
  moodIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  moodEmoji: {
    fontSize: 26,
    zIndex: 2,
  },
  moodLabel: {
    color: '#8A8A93',
    fontSize: 13,
    fontWeight: '700',
  },
  activeMoodLabel: {
    color: '#FFF',
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
