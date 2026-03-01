import { useOAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Warm up the android browser to improve UX
// https://docs.expo.dev/guides/authentication/#improving-user-experience
export const useWarmUpBrowser = () => {
    useEffect(() => {
        if (Platform.OS !== 'web') {
            void WebBrowser.warmUpAsync();
        }
        return () => {
            if (Platform.OS !== 'web') {
                void WebBrowser.coolDownAsync();
            }
        };
    }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function LandingScreen() {
    useWarmUpBrowser();
    const router = useRouter();
    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        console.log('Clerk User State:', user ? `Active (${user.id})` : 'No User');
        if (user) {
            router.replace('/(tabs)');
        }
    }, [user, router]);

    const handleGoogleSignIn = async () => {
        console.log('Starting Google OAuth Flow...');
        setLoading(true);
        try {
            const flowResult = await startOAuthFlow({
                redirectUrl: Linking.createURL('/(tabs)', { scheme: 'movies' }),
            });

            console.log('OAuth Flow Result:', JSON.stringify(flowResult, null, 2));

            const { createdSessionId, setActive } = flowResult;

            if (createdSessionId) {
                console.log('Session Created:', createdSessionId);
                await setActive!({ session: createdSessionId });

                // Note: The User object might not be immediately available via useUser right after setActive
                // But Clerk provides it via internal listeners. For high reliability, we sync in the Profile screen or a layout wrapper.
                // Here we let the useEffect handle navigation to the Home screen where extra sync can happen.

                router.replace('/(tabs)');
            } else {
                console.warn('Flow finished without session ID (MFA or other requirements needed).');
            }
        } catch (err) {
            console.error('OAuth Critical Failure:', err);
            alert(`Auth Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step < 2) {
            setStep(step + 1);
        }
    };

    const onboardingData = [
        {
            title: "Cinemate",
            subtitle: "Your premium gateway to the cinematic universe. Discover ratings, reviews, and trending masterpieces.",
            icon: "film",
            image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop'
        },
        {
            title: "Expert Insights",
            subtitle: "Access curated reviews and detailed metadata for over 500,000 movies and TV shows.",
            icon: "star",
            image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2000&auto=format&fit=crop'
        },
        {
            title: "Join Now",
            subtitle: "Sign in to personalize your watchlist and sync across all your devices.",
            icon: "person-add",
            image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2000&auto=format&fit=crop'
        }
    ];

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.heroSection}>
                <Image
                    source={{ uri: onboardingData[step].image }}
                    style={[StyleSheet.absoluteFillObject, { opacity: 0.6 }]}
                />

                <LinearGradient
                    colors={['rgba(13, 13, 20, 0)', 'rgba(13, 13, 20, 0.4)', '#0D0D14', '#0D0D14']}
                    style={styles.gradient}
                />

                <View style={styles.content}>
                    <View style={styles.logoWrapper}>
                        <View style={styles.iconBox}>
                            <Ionicons name={onboardingData[step].icon as any} size={42} color="#E50914" />
                        </View>
                        <Text style={styles.title}>{onboardingData[step].title}</Text>
                    </View>

                    <Text style={styles.subtitle}>
                        {onboardingData[step].subtitle}
                    </Text>

                    <View style={styles.pagination}>
                        {[0, 1, 2].map((i) => (
                            <View key={i} style={[styles.dot, i === step && styles.activeDot]} />
                        ))}
                    </View>

                    <View style={styles.actionContainer}>
                        {step < 2 ? (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.nextButton}
                                onPress={nextStep}
                            >
                                <Text style={styles.nextButtonText}>Next</Text>
                                <Ionicons name="arrow-forward" size={20} color="#FFF" />
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={styles.googleButtonWrapper}
                                    onPress={handleGoogleSignIn}
                                    disabled={loading}
                                >
                                    <BlurView intensity={20} tint="light" style={styles.googleBlur}>
                                        {loading ? <ActivityIndicator color="#FFF" /> : (
                                            <View style={styles.googleContentRow}>
                                                <Ionicons name="logo-google" size={22} color="#FFF" style={styles.googleIcon} />
                                                <Text style={styles.googleButtonText}>Continue with Google</Text>
                                            </View>
                                        )}
                                    </BlurView>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={styles.guestButton}
                                    onPress={() => router.replace('/(tabs)')}
                                    disabled={loading}
                                >
                                    <Text style={styles.guestButtonText}>Continue as Guest</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}

// A simple animated or static background of amazing movies mimicking Netflix/Apple TV landing pages
const AnimatedBackground = () => (
    <View style={StyleSheet.absoluteFillObject}>
        <Image
            source={{ uri: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop' }}
            style={[StyleSheet.absoluteFillObject, { width: undefined, height: undefined, opacity: 0.6 }]}
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D14',
    },
    heroSection: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '80%',
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingBottom: 60,
        zIndex: 10,
    },
    logoWrapper: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 40,
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 25,
        backgroundColor: 'rgba(229, 9, 20, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(229, 9, 20, 0.3)',
        shadowColor: '#E50914',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: -1,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#A0A0AA',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
        paddingHorizontal: 10,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
    },
    actionContainer: {
        width: '100%',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: '#E50914',
        width: 24,
    },
    nextButton: {
        flexDirection: 'row',
        width: '100%',
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E50914',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        marginRight: 10,
    },
    googleButtonWrapper: {
        width: '100%',
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    googleBlur: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Provides a subtle glass frost
    },
    googleContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleIcon: {
        marginRight: 10,
    },
    googleButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    guestButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    guestButtonText: {
        color: '#8A8A93',
        fontSize: 16,
        fontWeight: '600',
    },
});
