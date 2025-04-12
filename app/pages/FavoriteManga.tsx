import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, Image, TouchableOpacity, StyleSheet, StatusBar} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import useMangaStore from "@/app/stores/mangaStore";
import iMangaData from "@/app/_types/iManga";
import {useNavigation} from "@react-navigation/native";

type NavigationProps = {
    navigate: (screen: string, params?: any) => void;
};

const FavoriteMangasScreen = () => {
    const [favoriteManga, setFavoriteManga] = useState<Array<iMangaData>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const mangaStore = useMangaStore();
    const navigation = useNavigation<NavigationProps>();

    useEffect(() => {
        const loadFavorites = async () => {
            setIsLoading(true);
            try {
                const favorites = await mangaStore.getAllFavorites();
                setFavoriteManga(favorites);
            } catch (error) {
                console.error("Erro ao carregar favoritos:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadFavorites();
    }, []);

    const renderMangaItem = ({item}: { item: iMangaData }) => (
        <TouchableOpacity
            style={styles.mangaCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('MangaDetails', {title: item.title})}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{uri: item.image}}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.gradient}
                />
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700"/>
                    <Text style={styles.ratingText}>{`${item.nota}.0`}</Text>
                </View>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.cardFooter}>
                    <TouchableOpacity
                        style={styles.accessButton}
                        onPress={() => navigation.navigate('MangaDetails', {title: item.title})}
                    >
                        <Text style={styles.buttonText}>Ler Agora</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Meus Favoritos</Text>
            <View style={styles.headerUnderline}/>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando seus mangás...</Text>
            </View>
        );
    }

    return (
        <View style={styles.main}>
            <StatusBar barStyle="light-content" backgroundColor="#121212"/>
            {renderHeader()}

            <View style={styles.containerCard}>
                {favoriteManga.length > 0 ? (
                    <FlatList
                        data={favoriteManga}
                        renderItem={renderMangaItem}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.cardContainer}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={<View style={{height: 20}}/>}
                    />
                ) : (
                    <View style={styles.containerWithoutManga}>
                        <Ionicons name="book-outline" size={80} color="#666"/>
                        <Text style={styles.noMangaText}>
                            Você ainda não adicionou nenhum mangá aos favoritos
                        </Text>
                        <TouchableOpacity
                            style={styles.exploreButton}
                            onPress={() => navigation.navigate('AllMangasList')}
                        >
                            <Text style={styles.exploreButtonText}>Explorar Mangás</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#121212',
        paddingHorizontal: 12,
    },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    headerUnderline: {
        width: 60,
        height: 3,
        backgroundColor: '#10b981',
        borderRadius: 3,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    containerCard: {
        flex: 1,
    },
    cardContainer: {
        paddingHorizontal: 4,
    },
    mangaCard: {
        flex: 1,
        margin: 8,
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 6,
        height: 280,
    },
    imageContainer: {
        position: 'relative',
        height: 180,
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 60,
    },
    ratingContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        color: '#FFFFFF',
        marginLeft: 4,
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardContent: {
        padding: 12,
        flex: 1,
        justifyContent: 'space-between',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    cardFooter: {
        alignItems: 'center',
    },
    accessButton: {
        width: '100%',
        backgroundColor: '#10b981',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    containerWithoutManga: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    noMangaText: {
        fontSize: 16,
        color: '#CCCCCC',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    exploreButton: {
        backgroundColor: '#FF5252',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    exploreButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FavoriteMangasScreen;