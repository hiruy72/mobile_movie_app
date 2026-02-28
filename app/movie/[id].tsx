import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getImageUrl, getMovieDetails } from '../../utils/api';

const { width, height } = Dimensions.get('window');

export default function MovieDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [movie, setMovie] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const scrollY = new Animated.Value(0);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                const data = await getMovieDetails(Number(id));
                setMovie(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#E50914" />
            </View>
        );
    }

    if (!movie) {
        return (
            <View style={[styles.container, styles.center]}>
                <Ionicons name="alert-circle-outline" size={60} color="#E50914" />
                <Text style={styles.errorText}>Movie not found.</Text>
                <TouchableOpacity style={styles.backButtonCenter} onPress={() => router.back()}>
                    <Text style={styles.backText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Floating Back Button */}
            <TouchableOpacity
                style={styles.floatingBackButton}
                onPress={() => router.back()}
            >
                <BlurView intensity={80} tint="dark" style={styles.iconCircle}>
                    <Ionicons name="chevron-back" size={24} color="#FFF" style={{ marginLeft: -2 }} />
                </BlurView>
            </TouchableOpacity>

            <Animated.ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                <View style={styles.heroSection}>
                    <Animated.Image
                        source={{ uri: getImageUrl(movie.poster_path, 'original') }}
                        style={[
                            styles.heroImage,
                            {
                                transform: [
                                    {
                                        translateY: scrollY.interpolate({
                                            inputRange: [-height, 0, height],
                                            outputRange: [-height * 0.5, 0, height * 0.5],
                                        })
                                    },
                                    {
                                        scale: scrollY.interpolate({
                                            inputRange: [-height, 0],
                                            outputRange: [2, 1],
                                            extrapolateRight: 'clamp',
                                        })
                                    }
                                ]
                            }
                        ]}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(13, 13, 20, 0.4)', '#0D0D14']}
                        style={styles.gradient}
                    />

                    <View style={styles.heroContent}>
                        {/* Play Button Floating Center Above Text */}
                        <View style={styles.playButtonContainer}>
                            <TouchableOpacity style={styles.playButtonWrapper} activeOpacity={0.8}>
                                <BlurView intensity={90} tint="light" style={styles.playButtonBlur}>
                                    <Ionicons name="play" size={32} color="#000" style={{ marginLeft: 4 }} />
                                </BlurView>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.badgesWrapper}>
                            {movie.genres?.slice(0, 3).map((genre: any) => (
                                <View key={genre.id} style={styles.badge}>
                                    <Text style={styles.badgeText}>{genre.name}</Text>
                                </View>
                            ))}
                        </View>

                        <Text style={styles.title}>{movie.title || movie.name}</Text>

                        <View style={styles.metadataRow}>
                            <Text style={styles.subtitle}>
                                {movie.release_date?.substring(0, 4)} • {movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'Unknown'}
                            </Text>

                            {movie.vote_average ? (
                                <View style={styles.ratingBadge}>
                                    <Ionicons name="star" size={14} color="#FFD700" />
                                    <Text style={styles.ratingText}>{movie.vote_average.toFixed(1)}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                </View>

                <View style={styles.contentSection}>
                    <Text style={styles.sectionTitle}>Storyline</Text>
                    <Text style={styles.overview}>{movie.overview || "No description available."}</Text>

                    {movie.credits?.cast && movie.credits.cast.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Top Cast</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.castList}>
                                {movie.credits.cast.slice(0, 10).map((cast: any) => (
                                    <View key={cast.id} style={styles.castCard}>
                                        <Image
                                            source={{ uri: getImageUrl(cast.profile_path, 'w200') }}
                                            style={styles.castImage}
                                        />
                                        <Text style={styles.castName} numberOfLines={1}>{cast.name}</Text>
                                        <Text style={styles.characterName} numberOfLines={1}>{cast.character}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </>
                    )}

                    {/* Padding for bottom to separate from tab bar context if needed */}
                    <View style={{ height: 40 }} />
                </View>
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D14',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#FFF',
        fontSize: 20,
        marginTop: 20,
        marginBottom: 20,
        fontWeight: '700',
    },
    backButtonCenter: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    backText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    floatingBackButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    heroSection: {
        height: height * 0.7,
        width: '100%',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '60%',
    },
    heroContent: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    playButtonContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    playButtonWrapper: {
        width: 70,
        height: 70,
        borderRadius: 35,
        overflow: 'hidden',
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    playButtonBlur: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgesWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    badgeText: {
        color: '#EBEBF5',
        fontSize: 12,
        fontWeight: '700',
    },
    title: {
        fontSize: 38,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: -0.5,
        marginBottom: 12,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    metadataRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#EBEBF5',
        opacity: 0.8,
        fontWeight: '600',
        marginRight: 10,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        color: '#FFD700',
        fontSize: 13,
        fontWeight: '800',
        marginLeft: 4,
    },
    contentSection: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 40,
        backgroundColor: '#0D0D14',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 15,
        marginTop: 20,
        letterSpacing: 0.5,
    },
    overview: {
        fontSize: 15,
        color: '#A0A0AA',
        lineHeight: 24,
        letterSpacing: 0.2,
    },
    castList: {
        paddingRight: 20,
        paddingTop: 10,
    },
    castCard: {
        width: 90,
        marginRight: 15,
        alignItems: 'center',
    },
    castImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1A1A24',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    castName: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 4,
    },
    characterName: {
        color: '#8A8A93',
        fontSize: 11,
        textAlign: 'center',
        fontWeight: '500',
    },
});
