import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    FlatList,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import iMangaData from "@/app/_types/iManga";
import useMangaStore from "@/app/stores/mangaStore";
import {NavigationProps} from "@/app/_types/navigation/NavigationProps";

const Pagination = ({
                        currentPage,
                        totalPages,
                        onPageChange,
                        loading
                    }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    loading: boolean;
}) => {
    return (
        <View style={styles.pagination}>
            <TouchableOpacity
                style={[
                    styles.pageButton,
                    currentPage === 1 && styles.pageButtonDisabled
                ]}
                onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
            >
                <Text style={styles.pageButtonText}>←</Text>
            </TouchableOpacity>

            <View style={styles.pageInfo}>
                <Text style={styles.pageInfoText}>
                    {loading ?
                        <ActivityIndicator size="small" color="#3b82f6"/> :
                        `${currentPage} / ${totalPages}`
                    }
                </Text>
            </View>

            <TouchableOpacity
                style={[
                    styles.pageButton,
                    currentPage === totalPages && styles.pageButtonDisabled
                ]}
                onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
            >
                <Text style={styles.pageButtonText}>→</Text>
            </TouchableOpacity>
        </View>
    );
};

const MangaScreen = () => {
    const [mangas, setMangas] = useState<iMangaData[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [isExibindoTodos, setIsExibindoTodos] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const mangaStore = useMangaStore();
    const navigation = useNavigation<NavigationProps>();

    const fetchMangas = async (pageNumber = 1) => {
        try {
            setIsLoading(true);
            setIsExibindoTodos(true);
            setSearch('');
            const data = await mangaStore.getAllMangaPaginado(pageNumber, 10);
            setMangas(data.content);
            setPage(data.number + 1);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error('Erro ao buscar os mangás', err);
        } finally {
            setIsLoading(false);
        }
    };

    const searchManga = async () => {
        try {
            setIsLoading(true);
            if (search === '') {
                await fetchMangas(page);
            } else {
                const data = await mangaStore.getMangaPesquisado(search);
                if (data.content.length === 0) {
                    alert('Nenhum mangá encontrado...');
                } else {
                    setMangas(data.content);
                    setIsExibindoTodos(false);
                }
            }
        } catch (err) {
            alert('Erro ao buscar os mangás');
        } finally {
            setIsLoading(false);
        }
    };

    const addManga = async (id: number) => {
        try {
            await mangaStore.adicionaMangaNaListaDoUsuario(id);
            await fetchMangas(page);
        } catch (err: any) {
            alert(err.message || 'Erro ao adicionar');
        }
    };

    const removeManga = async (id: number) => {
        try {
            await mangaStore.removeDaLista(id);
            await fetchMangas(page);
        } catch (err: any) {
            alert(err.message || 'Erro ao remover');
        }
    };

    const handlePageChange = (newPage: number) => {
        fetchMangas(newPage);
    };

    useEffect(() => {
        fetchMangas(page);
    }, []);

    const renderMangaCard = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <Image
                source={{uri: item.image}}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.cardOverlay}/>
            <TouchableOpacity
                style={styles.titleContainer}
                onPress={() => navigation.navigate('MangaDetails', {title: item.title})}
            >
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            </TouchableOpacity>
            <View style={styles.info}>
                <Text style={styles.infoText}>📖 Capítulos: {item.size}</Text>
                <Text style={styles.infoText}>
                    <Text style={[
                        styles.statusIndicator,
                        {color: item.status === 'Ongoing' ? '#10b981' : '#f59e0b'}
                    ]}>•</Text> {item.status}
                </Text>
            </View>
            {isExibindoTodos && (
                <TouchableOpacity
                    style={[
                        styles.button,
                        {backgroundColor: item.favorite ? '#7f1d1d' : '#047857'}
                    ]}
                    onPress={() => item.favorite ? removeManga(item.id) : addManga(item.id)}
                >
                    <Text style={styles.buttonText}>
                        {item.favorite ? 'Remover da lista' : 'Adicionar na lista'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212"/>

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Manga Explorer</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Buscar mangá..."
                        placeholderTextColor="#9ca3af"
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={searchManga}
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={searchManga}>
                        <Text style={styles.searchButtonText}>🔍</Text>
                    </TouchableOpacity>
                </View>

                {!isExibindoTodos && (
                    <TouchableOpacity style={styles.resetButton} onPress={() => fetchMangas(1)}>
                        <Text style={styles.resetButtonText}>Exibir todos</Text>
                    </TouchableOpacity>
                )}
            </View>

            {mangas.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        {isLoading ? 'Carregando...' : 'Nenhum mangá encontrado!'}
                    </Text>
                </View>
            ) : (
                <>
                    <FlatList
                        data={mangas}
                        keyExtractor={(item) => item.title}
                        numColumns={2}
                        contentContainerStyle={styles.list}
                        renderItem={renderMangaCard}
                        columnWrapperStyle={styles.columnWrapper}
                        showsVerticalScrollIndicator={false}
                    />

                    {isExibindoTodos && totalPages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            loading={isLoading}
                        />
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingHorizontal: 16,
    },
    header: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d2d',
        marginBottom: 16,
    },
    headerTitle: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    searchContainer: {
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#ffffff',
        fontSize: 16,
    },
    searchButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButtonText: {
        fontSize: 18,
    },
    resetButton: {
        marginTop: 8,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#374151',
        alignSelf: 'flex-start',
    },
    resetButtonText: {
        color: '#ffffff',
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
    },
    list: {
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    card: {
        width: '48%',
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 5,
        borderWidth: 1,
        borderColor: '#333',
    },
    image: {
        width: '100%',
        height: 180,
    },
    cardOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 180,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    titleContainer: {
        padding: 10,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#ffffff',
        marginBottom: 6,
    },
    info: {
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    infoText: {
        color: '#d1d5db',
        marginBottom: 5,
        fontSize: 14,
    },
    statusIndicator: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    button: {
        marginTop: 5,
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        marginHorizontal: 10,
        marginBottom: 10,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#2d2d2d',
        marginTop: 10,
        marginBottom: 20,
    },
    pageButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        borderRadius: 8,
    },
    pageButtonDisabled: {
        backgroundColor: '#374151',
        opacity: 0.5,
    },
    pageButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    pageInfo: {
        paddingHorizontal: 16,
        minWidth: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageInfoText: {
        color: '#ffffff',
        fontSize: 16,
    },
});

export default MangaScreen;