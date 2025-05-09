import React, { useEffect, useState } from "react";
import EpisodeService from "@/class/services/EpisodeService";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    Image,
    ActivityIndicator,
    TextInput,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimeListingVO } from "@/_types/screens/listing-animes/AnimeListingVO";
import { EpisodeToAnimesVO } from "@/_types/screens/listing-animes/EpisodeToAnimesVO";
import { NavigationProps } from "@/_types/navigation/NavigationProps";
import { formatDate } from "@/utils/utils";
import AnimeService from "@/class/services/AnimeService";

const EpisodeListScreen = () => {
    const route = useRoute<any>();
    const service = new EpisodeService();
    const animeService = new AnimeService();
    const [nota, setNota] = useState<number>(0);
    const [title, setTitle] = useState<string>("");
    const navigation = useNavigation<NavigationProps>();
    const [loading, setLoading] = useState<boolean>(true);
    const [nameFormated, setNameFormated] = useState<string>("");
    const [infoAnime, setinfoAnime] = useState<AnimeListingVO>();
    const [isFormNota, setIsFormNota] = useState<boolean>(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const title = Array.isArray(route.params.title)
            ? route.params.title[0]
            : route.params.title;

        const idAnime = Array.isArray(route.params.id)
            ? route.params.id[0]
            : route.params.id;

        setTitle(title);

        try {
            const episodesData = await service.getAllEpisodesByAnime(idAnime);

            const releaseDateFormated = new Date(episodesData.launchYear);
            episodesData.launchYear = formatDate(releaseDateFormated);
            episodesData.note = episodesData.note ?? "N/I";

            setNameFormated(getNameFormated(episodesData.titleAnime));

            setinfoAnime(episodesData);
        } catch (error) {
            console.error("Erro ao buscar episódios:", error);
        } finally {
            setLoading(false);
        }
    };

    const getNameFormated = (name: string): string => {
        if(name.length > 10) {
            return `${name.substring(0, 18)}...`;
        }

        return name;
    }

    const renderEpisodeCard = (item: EpisodeToAnimesVO, index: any) => (
        <TouchableOpacity
            key={item.id ?? index}
            style={styles.card}
            onPress={() =>
                navigation.navigate("EpisodeDisplay", {
                    id: item.id
                })
            }
        >
            <View style={styles.episodeNumberContainer}>
                <Text style={styles.episodeNumber}>{item.numberEpisode}</Text>
            </View>

            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.titleEpisode}
                </Text>

                <View style={styles.cardFooter}>
                    <Ionicons name="play-circle" size={18} color="#ff6b6b" />
                    <Text style={styles.watchText}>Assistir</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEpisodeList = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#aa66ff" />
                    <Text style={styles.loadingText}>Carregando episódios...</Text>
                </View>
            )
        }

        if (infoAnime?.episodes?.length) {
            return (
                <FlatList
                    data={infoAnime.episodes}
                    renderItem={({ item, index }) => renderEpisodeCard(item, index)}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.cardContainer}
                    showsVerticalScrollIndicator={false}
                />
            )
        }

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#aa66ff" />
                < Text style={styles.emptyText} >
                    Esse anime não possui nenhum episódio cadastrado.
                </Text >
            </View >
        )
    }

    const renderizaIconeFavoritoAndAvaliacao = () => {
        return (
            <View style={styles.containerAvaliacao}>
                <Text
                    style={styles.avaliacaoText}
                    onPress={abrirModalAvaliacao}
                >
                    Avaliar anime
                </Text>

                <TouchableOpacity
                    style={styles.favoriteButton}
                    activeOpacity={0.6}>
                    <Ionicons
                        onPress={() => {
                            animeService.mudancaAvaliacao(infoAnime?.idAnime)
                            Alert.alert("Mudança realizada com sucesso!");
                            navigation.navigate("Home")
                        }}
                        name={infoAnime?.isFavorite ? "heart" : "heart-outline"}
                        size={28}
                        color="#ff6b6b"
                    />
                </TouchableOpacity>
            </View>
        );
    };

    const abrirModalAvaliacao = () => setIsFormNota(true);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.backButton}>
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color="#fff"
                            onPress={() => navigation.navigate("Home")}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{nameFormated}</Text>
                </View>
                <TouchableOpacity style={styles.favoriteButton}>
                    {renderizaIconeFavoritoAndAvaliacao()}
                </TouchableOpacity>
            </View>

            <View style={styles.bannerContainer}>
                <Image
                    source={{ uri: infoAnime?.uriImage }}
                    style={styles.bannerImage}
                />
                <View style={styles.bannerGradient} />
                <View style={styles.bannerContent}>
                    <Text style={styles.animeTitle}>{title}</Text>
                    <View style={styles.badgeContainer}>
                        {infoAnime?.tags?.map((tag, key) => (
                            <View key={key} style={styles.badge}>
                                <Text style={styles.badgeText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{infoAnime?.episodes?.length}</Text>
                    <Text style={styles.statLabel}>Episódios</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{infoAnime?.note}</Text>
                    <Text style={styles.statLabel}>Nota</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{infoAnime?.launchYear}</Text>
                    <Text style={styles.statLabel}>Ano</Text>
                </View>
            </View>

            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Lista de Episódios</Text>
            </View>

            {renderEpisodeList()}

            <Modal
                visible={isFormNota}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsFormNota(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>Você está avaliando: {title}</Text>

                        <TextInput
                            placeholder="Digite uma nota de 0 a 10"
                            value={nota.toString()}
                            onChangeText={(text) => {
                                const num = parseInt(text) || 0;
                                if (num >= 0 && num <= 10) {
                                    setNota(num);
                                }
                            }}
                            keyboardType="numeric"
                            maxLength={2}
                            style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginBottom: 12 }}
                        />

                        <TouchableOpacity
                            style={{ backgroundColor: '#ff6b6b', padding: 10, borderRadius: 6, marginBottom: 10 }}
                            onPress={() => {
                                animeService.avaliaAnime(infoAnime?.idAnime, nota);
                                Alert.alert("Avaliação enviada!");
                                setIsFormNota(false);
                                navigation.navigate("Home")
                            }}
                        >
                            <Text style={{ color: '#fff', textAlign: 'center' }}>Avaliar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setIsFormNota(false)}>
                            <Text style={{ color: '#333', textAlign: 'center' }}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "#1a1a1a",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    containerAvaliacao: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    avaliacaoButton: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    avaliacaoText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 10
    },
    favoriteButton: {
        padding: 5,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        marginLeft: 16,
    },
    bannerContainer: {
        position: "relative",
        width: "100%",
        height: 180,
    },
    bannerImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    bannerGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "70%",
        backgroundColor: "rgba(0,0,0,0)",
    },
    bannerContent: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
    },
    animeTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 8,
        textShadowColor: "rgba(0,0,0,0.75)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    badgeContainer: {
        flexDirection: "row",
        marginTop: 4,
    },
    badge: {
        backgroundColor: "#aa66ff",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#1e1e1e",
        paddingVertical: 12,
        marginBottom: 8,
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    statLabel: {
        fontSize: 12,
        color: "#999",
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: "#333",
    },
    listHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#2c2c44",
    },
    listTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#ff6b6b",
    },
    sortButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2c2c44",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    sortText: {
        color: "#fff",
        marginLeft: 4,
        fontSize: 12,
    },
    cardContainer: {
        padding: 12,
    },
    card: {
        flexDirection: "row",
        backgroundColor: "#1e1e1e",
        borderRadius: 12,
        marginBottom: 12,
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#aa66ff",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    episodeNumberContainer: {
        width: 60,
        height: 80,
        backgroundColor: "#2c2c44",
        justifyContent: "center",
        alignItems: "center",
    },
    episodeNumber: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#ff6b6b",
    },
    cardInfo: {
        flex: 1,
        padding: 12,
        justifyContent: "center",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
    },
    watchText: {
        color: "#ff6b6b",
        marginLeft: 4,
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: "#aa66ff",
        textAlign: "center",
        marginTop: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: "#fff",
        marginTop: 16,
        fontSize: 16,
    },
});

export default EpisodeListScreen;