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
import {AnimeListingVO} from "@/app/_types/screens/listing-animes/AnimeListingVO";
import {EpisodeToAnimesVO} from "@/app/_types/screens/listing-animes/EpisodeToAnimesVO";
import {NavigationProps} from "@/app/_types/navigation/NavigationProps";

const EpisodeListScreen = () => {
    const route = useRoute<any>();
    const service = new EpisodeService();
    const [title, setTitle] = useState<string>("");
    const navigation = useNavigation<NavigationProps>();
    const [loading, setLoading] = useState<boolean>(true);
    const [infoAnime, setinfoAnime] = useState<AnimeListingVO>();

    useEffect(() => {
        const title = Array.isArray(route.params.title)
            ? route.params.title[0]
            : route.params.title;

        const idAnime = Array.isArray(route.params.id)
            ? route.params.id[0]
            : route.params.id;

        setTitle(title);

        (async () => {
            try {
                const episodesData = await service.getAllEpisodesByAnime(idAnime);
                setinfoAnime(episodesData);
            } catch (error) {
                console.error("Erro ao buscar episódios:", error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const renderEpisodeCard = (item: EpisodeToAnimesVO, index: any) => (
        <TouchableOpacity
            key={item.id ?? index}
            style={styles.card}
            onPress={() => navigation.navigate('EpisodeDisplay', {
                id: item.id,
                title: item.titleEpisode
            })}
        >
            <View style={styles.episodeNumberContainer}>
                <Text style={styles.episodeNumber}>{item.numberEpisode}</Text>
            </View>

            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.titleEpisode}
                </Text>

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
                    <Text style={styles.headerTitle}>{infoAnime?.titleAnime}</Text>
                </View>
                <TouchableOpacity style={styles.favoriteButton}>
                    {
                        infoAnime?.isFavorite ?
                            <Ionicons name="heart" size={24} color="#ff6b6b"/> :
                            <Ionicons name="heart-outline" size={24} color="#ff6b6b"/>
                    }
                </TouchableOpacity>
            </View>

            <View style={styles.bannerContainer}>
                <Image
                    source={{uri: infoAnime?.uriImage}}
                    style={styles.bannerImage}
                />
                <View style={styles.bannerGradient}/>
                <View style={styles.bannerContent}>
                    <Text style={styles.animeTitle}>{title}</Text>
                    <View style={styles.badgeContainer}>
                        {infoAnime?.tags.map((tag) => (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{infoAnime?.episodes.length}</Text>
                    <Text style={styles.statLabel}>Episódios</Text>
                </View>
                <View style={styles.statDivider}/>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{infoAnime?.note}</Text>
                    <Text style={styles.statLabel}>Nota</Text>
                </View>
                <View style={styles.statDivider}/>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{infoAnime?.launchYear}</Text>
                    <Text style={styles.statLabel}>Ano</Text>
                </View>
            </View>

            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Lista de Episódios</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#aa66ff"/>
                    <Text style={styles.loadingText}>Carregando episódios...</Text>
                </View>
            ) : infoAnime && infoAnime?.episodes.length > 0 ? (
                <FlatList
                    data={infoAnime.episodes}
                    renderItem={({item, index}) => renderEpisodeCard(item, index)}
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