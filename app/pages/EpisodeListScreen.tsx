import {iEpisode} from "@/app/_types/iEpisode";
import React, {useEffect, useState} from "react";
import EpisodeService from "@/app/class/services/EpisodeService";
import {useRoute} from "@react-navigation/native";
import {
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    ActivityIndicator
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from '@react-navigation/native';

type NavigationProps = {
    navigate: (screen: string, params?: any) => void;
};

const EpisodeListScreen = () => {
    const route = useRoute<any>();
    const service = new EpisodeService();
    const [title, setTitle] = useState<string>("");
    const [idAnime, setIdAnime] = useState<string>("");
    const navigation = useNavigation<NavigationProps>();
    const [uriImage, setUriImage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [episodes, setEpisodes] = useState<Array<iEpisode>>([]);

    useEffect(() => {
        const title = Array.isArray(route.params.title)
            ? route.params.title[0]
            : route.params.title;

        const idAnime = Array.isArray(route.params.id)
            ? route.params.id[0]
            : route.params.id;

        setTitle(title);
        setIdAnime(idAnime);

        const fetchEpisodes = async () => {
            try {
                const uriImage = await service.getImageAnime(idAnime);
                const episodesData = await service.getAllEpisodesByAnime(idAnime);
                setEpisodes(episodesData);
                setUriImage(uriImage);
            } catch (error) {
                console.error("Erro ao buscar episódios:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEpisodes();
    }, []);

    const renderEpisodeCard = ({item}: { item: iEpisode }) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.episodeNumberContainer}>
                <Text style={styles.episodeNumber}>{item.numberEpisode}</Text>
            </View>
            <View style={styles.cardInfo}>
                <TouchableOpacity style={styles.backButton}>
                    <Text style={styles.cardTitle} numberOfLines={2}
                          onPress={() => navigation.navigate('EpisodeDisplay', {
                              id: item.id,
                              title: title
                          })}>
                        {item.title}
                    </Text>
                </TouchableOpacity>
                <View style={styles.cardFooter}>
                    <Ionicons name="play-circle" size={18} color="#ff6b6b"/>
                    <Text style={styles.watchText}>Assistir</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212"/>

            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" onPress={() => navigation.navigate('Home')}/>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{title || "Detalhes do Anime"}</Text>
                </View>
                <TouchableOpacity style={styles.favoriteButton}>
                    <Ionicons name="heart-outline" size={24} color="#ff6b6b"/>
                </TouchableOpacity>
            </View>

            <View style={styles.bannerContainer}>
                <Image
                    source={{uri: uriImage}}
                    style={styles.bannerImage}
                />
                <View style={styles.bannerGradient}/>
                <View style={styles.bannerContent}>
                    <Text style={styles.animeTitle}>{title}</Text>
                    <View style={styles.badgeContainer}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>TV</Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>HD</Text>
                        </View>
                        <View style={[styles.badge, {backgroundColor: '#ff6b6b'}]}>
                            <Text style={styles.badgeText}>NOVO</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{episodes.length}</Text>
                    <Text style={styles.statLabel}>Episódios</Text>
                </View>
                <View style={styles.statDivider}/>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>X</Text>
                    <Text style={styles.statLabel}>Nota</Text>
                </View>
                <View style={styles.statDivider}/>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>X</Text>
                    <Text style={styles.statLabel}>Ano</Text>
                </View>
            </View>

            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Lista de Episódios</Text>
                <View style={styles.sortButton}>
                    <Ionicons name="filter" size={18} color="#fff"/>
                    <Text style={styles.sortText}>Ordenar</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#aa66ff"/>
                    <Text style={styles.loadingText}>Carregando episódios...</Text>
                </View>
            ) : episodes && episodes.length > 0 ? (
                <FlatList
                    data={episodes}
                    renderItem={renderEpisodeCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.cardContainer}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#aa66ff"/>
                    <Text style={styles.emptyText}>Esse anime não possui nenhum episódio cadastrado.</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#1a1a1a',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    favoriteButton: {
        padding: 4,
    },
    bannerContainer: {
        position: 'relative',
        width: '100%',
        height: 180,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bannerGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70%',
        backgroundColor: 'rgba(0,0,0,0)',
    },
    bannerContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
    },
    animeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 3,
    },
    badgeContainer: {
        flexDirection: 'row',
        marginTop: 4,
    },
    badge: {
        backgroundColor: '#aa66ff',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#1e1e1e',
        paddingVertical: 12,
        marginBottom: 8,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#333',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2c2c44',
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff6b6b',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2c2c44',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    sortText: {
        color: '#fff',
        marginLeft: 4,
        fontSize: 12,
    },
    cardContainer: {
        padding: 12,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#aa66ff',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    episodeNumberContainer: {
        width: 60,
        height: 80,
        backgroundColor: '#2c2c44',
        justifyContent: 'center',
        alignItems: 'center',
    },
    episodeNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ff6b6b',
    },
    cardInfo: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    watchText: {
        color: '#ff6b6b',
        marginLeft: 4,
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#aa66ff',
        textAlign: 'center',
        marginTop: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 16,
        fontSize: 16,
    },
});

export default EpisodeListScreen;