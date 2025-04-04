import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Alert,
    KeyboardAvoidingView,
    Modal,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
import { Card, Button } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import useChapterStore from '@/app/stores/chapterStore';
import { StatusType } from '@/app/enums/StatusType';
import iChapterData from '../_types/iChapter';

type NavigationProps = {
    navigate: (screen: string, params?: any) => void;
};

type MangaViewerRouteParams = {
    id?: string;
    title?: string;
    progress?: number | string;
};

const MangaViewer = () => {
    const route = useRoute<RouteProp<Record<string, MangaViewerRouteParams>, string>>();
    const navigation = useNavigation<NavigationProps>();
    const chapterStore = useChapterStore();
    const scrollViewRef = useRef(null);

    // Estado
    const [currentProgress, setCurrentProgress] = useState(1);
    const [showModalResetReading, setShowModalResetReading] = useState(false);
    const [showThumbnails, setShowThumbnails] = useState(false);
    const [currentChapter, setCurrentChapter] = useState<iChapterData>({} as iChapterData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isTelaCheia, setIsTelaCheia] = useState(false);
    const [idChapter, setIdChapter] = useState('');
    const [titleManga, setTitleManga] = useState('');
    const [qntdExibicaoModal, setQntdExibicaoModal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [allImages, setAllImages] = useState<Array<any>>([]);
    const [modalShownForThisChapter, setModalShownForThisChapter] = useState(false);

    // Variáveis derivadas
    const currentPageNumber = currentPageIndex + 1;
    const currentImage = allImages[currentPageIndex] || '';
    const canNavigateNext = currentPageIndex < totalPages - 1;
    const canNavigatePrevious = currentPageIndex > 0;

    const resetState = useCallback(() => {
        setShowModalResetReading(false);
        setQntdExibicaoModal(0);
        setModalShownForThisChapter(false);
        setIsTelaCheia(false);
    }, []);

    const getThumbnailPages = useCallback(() => {
        const start = Math.max(0, currentPageIndex - 2);
        const end = Math.min(totalPages, currentPageIndex + 3);
        return Array.from({ length: end - start }, (_, i) => ({
            index: start + i,
            src: allImages[start + i] || ''
        }));
    }, [currentPageIndex, totalPages, allImages]);

    const loadAllPages = useCallback(async (chapterId: string) => {
        try {
            setIsLoading(true);
            setError(null);
            setAllImages([]);
    
            resetState();
    
            const total = await chapterStore.getQuantidadePaginasDoCapitulo(chapterId);
            setTotalPages(total);
    
            const loadPromises = Array.from({ length: total }, async (_, index) => {
                try {
                    const response: any = await chapterStore.getPaginaDoCapitulo(chapterId, index);
                    console.log("Resposta da API:", response);
    
                    if (response._data?.blobId) {
                        return `blob://${response._data.blobId}`;
                    }
    
                    return null;
                } catch (error) {
                    console.error(`Erro ao carregar página ${index}:`, error);
                    return null;
                }
            });
    
            const images = await Promise.all(loadPromises);
            setAllImages(images.filter(Boolean)); // Remove valores null
    
            setCurrentPageIndex(currentProgress - 1);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Erro ao carregar o capítulo";
            setError(errorMsg);
            Alert.alert("Erro", errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [chapterStore, currentProgress, resetState]);
       
    const atualizaProgresso = useCallback(async () => {
        if (
            idChapter &&
            currentChapter.status !== StatusType.FINISHED &&
            currentProgress > currentChapter.readingProgress
        ) {
            await chapterStore.updateReadingProgress(idChapter, currentProgress);
        }
    }, [idChapter, currentChapter, currentProgress, chapterStore]);

    const nextPage = useCallback(() => {
        if (canNavigateNext)
            setCurrentPageIndex(prev => prev + 1);
    }, [canNavigateNext]);

    const previousPage = useCallback(() => {
        if (canNavigatePrevious) {
            setCurrentPageIndex(prev => prev - 1);
        }
    }, [canNavigatePrevious]);

    const jumpToPage = useCallback((pageIndex: number) => {
        setCurrentPageIndex(pageIndex);
        setShowThumbnails(false);
    }, []);

    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
    }, []);

    const handleImageError = useCallback(() => {
        const errorMsg = 'Failed to load image';
        setError(errorMsg);
        Alert.alert('Erro', errorMsg);
    }, []);

    const handleChapterChange = useCallback(async (id: string, title = '', progress = 1) => {
        if (!id) {
            setError('Invalid chapter ID');
            setIsLoading(false);
            return;
        }

        setIdChapter(id);
        setTitleManga(title);
        setCurrentProgress(progress === 0 ? 1 : progress);

        await chapterStore.updateReadingProgress(id, progress);
        const chapter = await chapterStore.getReadingProgress(id);
        setCurrentChapter(chapter);

        await loadAllPages(id);
    }, [chapterStore, loadAllPages]);

    // Efeito para inicializar o componente
    useEffect(() => {
        const id = route.params?.id ?? '';
        const title = route.params?.title ?? '';
        const progress = Number(route.params?.progress ?? 1);

        handleChapterChange(id, title, progress);

        // Limpeza ao desmontar
        return () => {
            atualizaProgresso();
        };
    }, []);

    // Efeito para lidar com mudanças na rota
    useFocusEffect(
        useCallback(() => {
            const id = route.params?.id;
            const title = route.params?.title ?? '';
            const progress = Number(route.params?.progress ?? 1);

            if (id && idChapter && id !== idChapter) {
                atualizaProgresso().then(() => {
                    resetState();
                    handleChapterChange(id, title, progress);
                });
            }

            return () => { }; // Função de limpeza vazia
        }, [route.params, idChapter, atualizaProgresso, resetState, handleChapterChange])
    );

    // Efeito para monitorar mudanças na página atual
    useEffect(() => {
        if (currentPageIndex >= currentProgress - 1) {
            setCurrentProgress(currentPageIndex + 1);
        }

        // Mostrar modal ao concluir a leitura
        if (
            currentProgress === currentChapter.readingProgress &&
            !modalShownForThisChapter &&
            qntdExibicaoModal === 0 &&
            totalPages > 0 &&
            currentPageIndex === totalPages - 1
        ) {
            setShowModalResetReading(true);
            setQntdExibicaoModal(prev => prev + 1);
            setModalShownForThisChapter(true);
        }
    }, [currentPageIndex, currentProgress, currentChapter, modalShownForThisChapter, qntdExibicaoModal, totalPages]);

    const navigateToMangaDetail = useCallback(() => {
        atualizaProgresso().then(() => {
            resetState();
            navigation.navigate('MangaDetail', { id: titleManga });
        });
    }, [atualizaProgresso, resetState, navigation, titleManga]);

    const toggleFullscreen = useCallback(() => {
        setIsTelaCheia(prev => !prev);
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#BB86FC" />
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            );
        }

        return (
            <View style={styles.contentContainer}>
                <TouchableOpacity
                    style={styles.btnBack}
                    onPress={navigateToMangaDetail}
                >
                    <Ionicons name="arrow-back-outline" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.btnExpandir}
                    onPress={toggleFullscreen}
                >
                    <Ionicons
                        name={isTelaCheia ? "chevron-up-outline" : "expand-outline"}
                        size={24}
                        color="#fff"
                    />
                </TouchableOpacity>

                {currentImage ? (
                    <Image
                        source={{ uri: currentImage }}
                        style={isTelaCheia ? styles.imageExpand : styles.image}
                        resizeMode="contain"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No pages available for this chapter</Text>
                    </View>
                )}
            </View>
        );
    };

    const closeFinalModal = useCallback(() => {
        setShowModalResetReading(false);
    }, []);

    return (
        <KeyboardAvoidingView style={styles.container}>
            <Modal
                visible={showModalResetReading}
                transparent={true}
                animationType="fade"
                onRequestClose={closeFinalModal}
            >
                <View style={styles.modalContainer}>
                    <Card style={styles.modalCard}>
                        <Card.Title title="Capítulo finalizado" subtitle="Parabéns!" />
                        <Card.Content>
                            <Text style={styles.modalText}>XP coletado com sucesso!</Text>
                        </Card.Content>
                        <Card.Actions>
                            <Button onPress={closeFinalModal}>Fechar</Button>
                        </Card.Actions>
                    </Card>
                </View>
            </Modal>

            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
            >
                <Card style={styles.card}>
                    {renderContent()}

                    {currentImage && !isTelaCheia && (
                        <View style={styles.controls}>
                            <View style={styles.info}>
                                <Text style={styles.infoText}>Página {currentPageNumber} de {totalPages}</Text>
                            </View>

                            <View style={styles.navigation}>
                                <Button
                                    mode="contained"
                                    disabled={!canNavigatePrevious}
                                    onPress={previousPage}
                                    style={styles.navButton}
                                    onTouchStart={() => setShowThumbnails(true)}
                                >
                                    Anterior
                                </Button>

                                {showThumbnails && (
                                    <View style={styles.thumbnailContainer}>
                                        <FlatList
                                            horizontal
                                            data={getThumbnailPages()}
                                            keyExtractor={(item) => item.index.toString()}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity onPress={() => jumpToPage(item.index)}>
                                                    <Image
                                                        source={{ uri: item.src }}
                                                        style={[
                                                            styles.thumbnail,
                                                            item.index === currentPageIndex && styles.activeThumbnail
                                                        ]}
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                )}

                                <Button
                                    mode="contained"
                                    disabled={!canNavigateNext}
                                    onPress={nextPage}
                                    style={styles.navButton}
                                    onTouchStart={() => setShowThumbnails(true)}
                                >
                                    Próximo
                                </Button>
                            </View>
                        </View>
                    )}
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    card: {
        flex: 1,
        margin: 8,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorContainer: {
        padding: 16,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderRadius: 8,
        margin: 10,
    },
    errorText: {
        color: '#CF6679',
        textAlign: 'center',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        paddingBottom: 70,
    },
    image: {
        width: width - 40,
        height: height * 0.75,
        resizeMode: 'contain',
    },
    imageExpand: {
        width: width - 20,
        height: height * 0.9,
        resizeMode: 'contain',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        fontSize: 16,
    },
    controls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        backgroundColor: 'rgba(30, 30, 30, 0.9)',
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    info: {
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    navigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    navButton: {
        minWidth: 100,
    },
    thumbnailContainer: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    thumbnail: {
        width: 50,
        height: 70,
        borderWidth: 2,
        borderColor: 'transparent',
        marginHorizontal: 2,
    },
    activeThumbnail: {
        borderColor: '#ff4500',
    },
    btnBack: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
    },
    btnExpandir: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalCard: {
        width: '80%',
        padding: 20,
    },
    modalText: {
        fontSize: 16,
        marginVertical: 10,
    },
});

export default MangaViewer;