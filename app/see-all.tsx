import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { fetchMoviesByMood, fetchTrendingAll, fetchTrendingMovies, fetchTrendingTV, getImageUrl } from '../utils/api';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const SPACING = 15;
const ITEM_WIDTH = (width - (SPACING * (COLUMN_COUNT + 1))) / COLUMN_COUNT;

export default function SeeAllScreen() {
    const router = useRouter();
    const { title, type, mood } = useLocalSearchParams<{ title: string; type: string; mood?: string }>();

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                let data = [];
                if (mood) {
                    // Find mood genres if mood is provided
                    // For simplicity, let's re-define them here or share them
                    const moodsList = [
                        { label: 'Happy', genres: [35, 10751] },
                        { label: 'Sad', genres: [18] },
                        { label: 'Broken', genres: [10749, 18] },
                        { label: 'Excited', genres: [28, 12] },
                        { label: 'Bored', genres: [53, 9648] },
                        { label: 'Spooky', genres: [27] },
                    ];
                    const moodObj = moodsList.find(m => m.label === mood);
                    data = await fetchMoviesByMood(moodObj?.genres || []);
                } else {
                    if (type === 'Movies') {
                        data = await fetchTrendingMovies();
                    } else if (type === 'TV Series') {
                        data = await fetchTrendingTV();
                    } else {
                        data = await fetchTrendingAll();
                    }
                }
                setItems(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [type, mood]);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/movie/${item.id}` as any)}
            activeOpacity={0.8}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: getImageUrl(item.poster_path, 'w342') }}
                    style={styles.image}
                />
                <View style={styles.ratingBadge}>
                    <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                    <Text style={styles.ratingText}>{item.vote_average?.toFixed(1)}</Text>
                </View>
            </View>
            <View style={styles.info}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title || item.name}</Text>
                <Text style={styles.itemSubtitle} numberOfLines={1}>
                    {item.release_date || item.first_air_date || 'Coming Soon'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#1A1A24', '#0D0D14']}
                style={styles.background}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title || 'See All'}</Text>
                <View style={{ width: 45 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#E50914" />
                </View>
            ) : (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={COLUMN_COUNT}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D14',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        zIndex: 10,
    },
    backButton: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: SPACING,
        paddingBottom: 40,
    },
    card: {
        width: ITEM_WIDTH,
        marginBottom: 20,
        marginHorizontal: SPACING / 2,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 2 / 3,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#1A1A24',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    ratingBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    ratingText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '900',
        zIndex: 1,
    },
    info: {
        marginTop: 10,
        paddingHorizontal: 4,
    },
    itemTitle: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    itemSubtitle: {
        color: '#8A8A93',
        fontSize: 12,
        fontWeight: '500',
    },
});
