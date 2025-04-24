import {iAnime} from "@/app/_types/iAnime";
import React, {useEffect, useState} from "react";
import {useNavigation} from '@react-navigation/native';
import AnimeService from "@/app/class/services/AnimeService";
import {FlatList, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View} from "react-native";

type NavigationProps = {
    navigate: (screen: string, params?: any) => void;
};

const AnimesListScreen = () => {
    const service = new AnimeService();
    const [animes, setAnimes] = useState<Array<iAnime>>([]);
    const navigation = useNavigation<NavigationProps>();

    useEffect(() => {
        service.getAllAnimes().then(animes => setAnimes(animes));
    }, []);

    const renderAnimeCard = ({item}: { item: iAnime }) => (
        <View style={styles.card}>
            <View style={styles.imageContainer}>
                <Image
                    source={{uri: item?.uriImage}}
                    style={styles.cardImage}
                    defaultSource={{uri: "https://github.com/andrewgpfranco.png"}}
                />
            </View>

            <View style={styles.cardContent}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('EpisodeList', {title: item.title, id: item.id})}>
                    <Text style={styles.cardTitle}>{item?.title}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#121212"/>

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Biblioteca dos animes</Text>
                </View>

                {animes && animes.length > 0 ? (
                    <FlatList
                        data={animes}
                        renderItem={renderAnimeCard}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.cardContainer}
                        numColumns={2}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Não há nenhum anime em sua lista.</Text>
                    </View>
                )}
            </SafeAreaView>
        </>
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

export default AnimesListScreen;