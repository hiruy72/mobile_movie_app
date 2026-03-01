import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { syncUserToDB, updateUserProfile } from '../../utils/userService';

const { width } = Dimensions.get('window');

export default function EditProfileScreen() {
    const { user } = useUser();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');

    useEffect(() => {
        async function initProfile() {
            if (user) {
                const dbUser = await syncUserToDB(user);
                if (dbUser) {
                    setFullName(dbUser.fullName || '');
                    setBio(dbUser.bio || '');
                }
            }
            setLoading(false);
        }
        initProfile();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        const updated = await updateUserProfile(user.id, {
            fullName,
            bio,
        });

        if (updated) {
            Alert.alert('Success', 'Your profile masterpiece has been saved!');
            router.back();
        } else {
            Alert.alert('Error', 'Failed to update profile. Please check your connection.');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E50914" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#1A1A24', '#0D0D14']}
                style={styles.background}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={28} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Edit Profile</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    {/* Profile Image Section */}
                    <View style={styles.imageSection}>
                        <View style={styles.imageWrapper}>
                            <Image source={{ uri: user?.imageUrl }} style={styles.profileImage} />
                            <TouchableOpacity style={styles.cameraIcon}>
                                <Ionicons name="camera" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.emailText}>{user?.primaryEmailAddress?.emailAddress}</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Enter your name"
                                placeholderTextColor="#666"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bio / Favorite Genre</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Tell us about your cinematic taste..."
                                placeholderTextColor="#666"
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <LinearGradient
                                colors={['#E50914', '#B00710']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.saveGradient}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.saveText}>Save Masterpiece</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D14',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0D0D14',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        marginBottom: 30,
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
    },
    imageSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    imageWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#E50914',
        padding: 3,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#E50914',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#0D0D14',
    },
    emailText: {
        color: '#8A8A93',
        marginTop: 15,
        fontSize: 14,
    },
    form: {
        paddingHorizontal: 24,
    },
    inputGroup: {
        marginBottom: 25,
    },
    label: {
        color: '#8A8A93',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 20,
        paddingVertical: 18,
        color: '#FFF',
        fontSize: 16,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    saveButton: {
        marginTop: 20,
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#E50914',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    saveGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
