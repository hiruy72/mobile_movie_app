import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { getImageUrl, searchMovies } from '../../utils/api';

const { width } = Dimensions.get('window');
const HISTORY_KEY = '@search_history';

export default function SearchScreen() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const saved = await AsyncStorage.getItem(HISTORY_KEY);
            if (saved) setHistory(JSON.parse(saved));
        } catch (e) {
            console.error(e);
        }
    };

    const saveToHistory = async (searchQuery: string) => {
        if (!searchQuery.trim()) return;
        try {
            let current = [...history];
            if (!current.includes(searchQuery)) {
                current = [searchQuery, ...current].slice(0, 5);
                setHistory(current);
                await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(current));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const clearHistory = async () => {
        try {
            await AsyncStorage.removeItem(HISTORY_KEY);
            setHistory([]);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSearch = async (text: string) => {
        setQuery(text);
        if (text.length > 2) {
            setLoading(true);
            const data = await searchMovies(text);
            setResults(data);
            setLoading(false);
        } else {
            setResults([]);
        }
    };

    const submitSearch = () => {
        saveToHistory(query);
    };

    const onHistoryTap = (item: string) => {
        setQuery(item);
        handleSearch(item);
        saveToHistory(item);
    };

    const renderResultItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.resultCard}
            onPress={() => router.push(`/movie/${item.id}` as any)}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: getImageUrl(item.poster_path, 'w342') }}
                style={styles.thumbnail}
            />

            {/* Absolute overlay logic for image inside the result card to make it pop */}
            <View style={styles.resultOverlayInfo}>
                <LinearGradient
                    colors={['transparent', 'rgba(13, 13, 20, 0.4)', 'rgba(13, 13, 20, 0.95)']}
                    style={styles.cardGradient}
                />
                <View style={styles.resultTextWrapper}>
                    <Text style={styles.resultTitle} numberOfLines={2}>
                        {item.title || item.name}
                    </Text>
                    <View style={styles.resultSubtitleRow}>
                        {item.vote_average ? (
                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Text style={styles.ratingText}>{item.vote_average.toFixed(1)}</Text>
                            </View>
                        ) : null}
                        <Text style={styles.resultYear}>
                            {item.release_date?.substring(0, 4) || 'TBA'}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Explore</Text>

                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#8A8A93" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search movies, genre, keywords..."
                            placeholderTextColor="#8A8A93"
                            value={query}
                            onChangeText={handleSearch}
                            onSubmitEditing={submitSearch}
                            returnKeyType="search"
                            selectionColor="#E50914"
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => handleSearch('')} style={styles.closeBtn}>
                                <Ionicons name="close-circle" size={20} color="#8A8A93" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {query.length === 0 && history.length > 0 && (
                <View style={styles.historyContainer}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>Recent Discoveries</Text>
                        <TouchableOpacity onPress={clearHistory}>
                            <Text style={styles.clearText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.chipContainer}>
                        {history.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.historyChip}
                                onPress={() => onHistoryTap(item)}
                            >
                                <Ionicons name="time-outline" size={14} color="#8A8A93" style={styles.chipIcon} />
                                <Text style={styles.chipText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {loading ? (
                <ActivityIndicator size="large" color="#E50914" style={{ marginTop: 60 }} />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderResultItem}
                    numColumns={2}
                    columnWrapperStyle={styles.rowWrapper}
                    ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
                />
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D14',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 70 : 50,
        marginBottom: 20,
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
        color: '#FFF',
        marginBottom: 20,
        letterSpacing: 0.5,
    },
    searchContainer: {
        shadowColor: '#E50914',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(35, 35, 45, 0.8)',
        borderRadius: 20,
        paddingHorizontal: 18,
        height: 55,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    searchInput: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
        marginLeft: 12,
        fontWeight: '500',
    },
    closeBtn: {
        padding: 5,
    },
    historyContainer: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    historyTitle: {
        color: '#EBEBF5',
        fontSize: 18,
        fontWeight: '700',
    },
    clearText: {
        color: '#E50914',
        fontSize: 14,
        fontWeight: '600',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    historyChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1C26',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#2A2A35',
    },
    chipIcon: {
        marginRight: 6,
    },
    chipText: {
        color: '#D1D1D6',
        fontSize: 14,
        fontWeight: '500',
    },
    listContainer: {
        paddingHorizontal: 15,
        paddingBottom: 120,
    },
    rowWrapper: {
        justifyContent: 'space-between',
    },
    resultCard: {
        width: (width - 45) / 2,
        height: ((width - 45) / 2) * 1.5,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#1A1A24',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    resultOverlayInfo: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    cardGradient: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '70%',
    },
    resultTextWrapper: {
        padding: 12,
        zIndex: 2,
    },
    resultTitle: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 6,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    resultSubtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
    },
    ratingText: {
        color: '#FFD700',
        fontSize: 11,
        fontWeight: '700',
        marginLeft: 4,
    },
    resultYear: {
        color: '#EBEBF5',
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.8,
    },
});
