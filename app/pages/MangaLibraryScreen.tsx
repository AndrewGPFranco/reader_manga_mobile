import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    SafeAreaView,
    StatusBar, Alert
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import iMangaData from "@/app/_types/iManga";
import useMangaStore from "@/app/stores/mangaStore";
import useAuthStore from "@/app/stores/authStore";
import iResponseListManga from "@/app/_types/iResponseListManga";

type NavigationProps = {
    navigate: (screen: string, params?: any) => void;
};

const MangaLibraryScreen = () => {
    const [mangasArray, setMangasArray] = useState<Array<iMangaData>>([]);

    const authStore = useAuthStore();
    const mangaStore = useMangaStore();
    const navigation = useNavigation<NavigationProps>();

    const setFavorite = async (mangaId: number) => {
        const response = await mangaStore.setFavorite(mangaId)
        if (response.statusCode == 200) {
            const userId = await authStore.getIdUsuario()
            if (userId !== null) {
                const mangasDoUsuario: iResponseListManga = await mangaStore.getListMangaByUser(userId)
                setMangasArray(mangasDoUsuario.mangaList);
            }
        }
    };

    useEffect(() => {
        const fetchMangas = async () => {
            try {
                const user = await authStore.getUserAutenticado()
                let mangas: iResponseListManga = { mangaList: [] }
                const userId = user.getId()
                if (userId !== undefined)
                    mangas = await mangaStore.getListMangaByUser(userId);

                setMangasArray(mangas.mangaList)
            } catch (error: any) {
                Alert.alert(error.message || 'Erro ao buscar os mangás')
            }
        }

        fetchMangas()
    }, []);

    const renderMangaCard = ({item}: { item: iMangaData }) => (
        <View style={styles.card}>
            <View style={styles.imageContainer}>
                <Image
                    source={{uri: item?.image}}
                    style={styles.cardImage}
                    defaultSource={{ uri: "https://github.com/andrewgpfranco.png" }}
                />
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => setFavorite(item.id)}
                >
                    <Icon
                        name={item?.favorite ? "heart" : "heart-outline"}
                        size={28}
                        color="#aa66ff"
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
                <TouchableOpacity onPress={() => navigation.navigate('MangaDetails', {title: item.title})}>
                    <Text style={styles.cardTitle}>{item?.title}</Text>
                </TouchableOpacity>

                <View style={styles.cardDetails}>
                    <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Capítulos: </Text>
                        {item?.size}
                    </Text>
                    <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Status: </Text>
                        {item?.status}
                    </Text>
                    <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Autor: </Text>
                        {item?.author}
                    </Text>
                    <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Gênero: </Text>
                        {item?.gender}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212"/>

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Biblioteca</Text>
            </View>

            {mangasArray && mangasArray.length > 0 ? (
                <FlatList
                    data={mangasArray}
                    renderItem={renderMangaCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.cardContainer}
                    numColumns={2}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Não há nenhum mangá em sua lista.</Text>
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#aa66ff',
    },
    cardContainer: {
        padding: 8,
    },
    card: {
        flex: 1,
        margin: 8,
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#aa66ff',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        maxWidth: '47%',
    },
    imageContainer: {
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 4,
        zIndex: 10,
    },
    cardContent: {
        padding: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    cardDetails: {
        marginTop: 6,
    },
    detailText: {
        fontSize: 13,
        color: '#bbb',
        marginBottom: 4,
    },
    detailLabel: {
        fontWeight: 'bold',
        color: '#aa66ff',
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
    },
});

export default MangaLibraryScreen;