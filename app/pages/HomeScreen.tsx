import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator, 
    Alert,
    BackHandler,
} from "react-native";
import { Button, Card } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Navbar from "@/components/home/Navbar";
import { api } from "@/app/network/axiosInstance";
import iMangaData from "@/app/_types/iManga";
import useAuthStore from "../stores/authStore";
import { useFocusEffect } from "expo-router";
import { NavigationProps } from "@/app/_types/navigation/NavigationProps";

const HomeScreen = () => {
    const [mangas, setMangas] = useState<iMangaData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const authStore = useAuthStore();
    const navigation = useNavigation<NavigationProps>();

    const getMangas = async () => {
        try {
            const response = await api.get(
                `/manga/readAll/${await authStore.getIdUsuario()}`,
                {
                    headers: {
                        Authorization: `${await authStore.getToken()}`,
                    },
                }
            );
            setMangas(response.data);
        } catch (err) {
            console.log(err);
            setError("Erro ao carregar os mangás");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                return true;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );

    useEffect(() => {
        getMangas();
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <ActivityIndicator size="large" color="#BB86FC" style={styles.loader} />
            );
        }

        if (error !== "")
            return <Text style={styles.errorText}>{error}</Text>;

        return (
            <View style={styles.mangaGrid}>
                {mangas.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.mangaCard}
                        onPress={() =>
                            navigation.navigate("MangaDetails", { title: item.title })
                        }
                    >
                        <Image source={{ uri: item.image }} style={styles.mangaImage} />
                        <View style={styles.overlay}>
                            <Text style={styles.mangaTitle}>{item.title}</Text>
                            <Button
                                mode="contained"
                                onPress={() =>
                                    navigation.navigate("MangaDetails", { title: item.title })
                                }
                            >
                                Ler agora
                            </Button>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const [showMoreOptions, setShowMoreOptions] = useState(false);

    const mainMenuItems = [
        {
            label: "Leitura",
            icon: "hourglass-outline",
            onPress: () => navigation.navigate("ProgressReading"),
        },
        {
            label: "Mangás",
            icon: "book",
            onPress: () => navigation.navigate("AllMangasList"),
        },
        {
            label: "Favoritos",
            icon: "bookmark",
            onPress: () => navigation.navigate("Favorites"),
        },
        {
            label: "Animes",
            icon: "tv-outline",
            onPress: () => navigation.navigate("AllAnimesList"),
        },
    ];

    const extraMenuItems = [
        {
            label: "Jobs",
            icon: "briefcase",
            onPress: () => navigation.navigate("Job"),
        },
        {
            label: "Biblioteca",
            icon: "book-outline",
            onPress: () => navigation.navigate("Library"),
        },
        {
            label: "Atualizar",
            icon: "refresh",
            onPress: async () => {
                await getMangas();
                Alert.alert("Lista de mangás atualizada.");
            },
        },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: "#121212" }}>
            <ScrollView style={styles.container}>
                <Navbar />
                <Card style={styles.card}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mangás Populares</Text>
                    </View>
                    {renderContent()}
                </Card>
                <View style={styles.bottomSpacing} />
            </ScrollView>

            <View style={styles.bottomMenu}>
                {mainMenuItems.map((item, index) => (
                    <TouchableOpacity key={index} style={styles.menuButton} onPress={item.onPress}>
                        <Ionicons name={item.icon as any} size={20} color="#fff" />
                        <Text style={styles.menuLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setShowMoreOptions(true)}
                >
                    <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
                    <Text style={styles.menuLabel}>Mais</Text>
                </TouchableOpacity>
            </View>

            {showMoreOptions && (
                <View style={styles.moreMenuOverlay}>
                    <View style={styles.moreMenu}>
                        {extraMenuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.moreMenuItem}
                                onPress={() => {
                                    item.onPress();
                                    setShowMoreOptions(false);
                                }}
                            >
                                <Ionicons name={item.icon as any} size={20} color="#fff" />
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <Button
                            onPress={() => setShowMoreOptions(false)}
                            mode="contained"
                            style={{ marginTop: 12, backgroundColor: "#BB86FC" }}
                        >
                            Fechar
                        </Button>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#121212" },
    card: {
        marginTop: -25,
        backgroundColor: "#121212",
        padding: 16,
        borderRadius: 8,
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
    },
    header: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 16,
        marginHorizontal: 4,
    },
    button: {
        flex: 1,
        minWidth: 150,
        borderRadius: 8,
        elevation: 3,
        marginBottom: 8,
    },
    buttonLabel: {
        fontSize: 14,
        fontWeight: '600',
        paddingVertical: 2,
    },
    title: { fontSize: 22, fontWeight: "bold", color: "#BB86FC" },
    section: { marginBottom: 20 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        marginBottom: 8,
    },
    loader: { marginVertical: 20 },
    errorText: { color: "#CF6679", textAlign: "center", marginVertical: 10 },
    mangaGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 16,
    },
    mangaCard: {
        width: 150,
        height: 220,
        position: "relative",
        overflow: "hidden",
        borderRadius: 8,
        elevation: 3,
        backgroundColor: "#1E1E1E",
    },
    mangaImage: { width: "100%", height: "100%", resizeMode: "cover" },
    overlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 8,
    },
    mangaTitle: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 4,
    },
    bottomSpacing: { height: 20 },
    bottomMenu: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#1E1E1E",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#333",
    },
    menuButton: {
        alignItems: "center",
    },
    menuLabel: {
        color: "#fff",
        fontSize: 12,
        marginTop: 4,
    },
    moreMenuOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: 20,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    moreMenu: {
        backgroundColor: "#2C2C2C",
        padding: 16,
        borderRadius: 12,
    },
    moreMenuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
    },
});

export default HomeScreen;