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
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import useChapterStore from '@/app/stores/chapterStore';
import iChapterData from '../_types/iChapter';

type NavigationProps = {
    navigate: (screen: string, params?: any) => void;
};

type MangaViewerRouteParams = {
    id?: string;
    title?: string;
    progress?: number | string;
};

const { width, height } = Dimensions.get('screen');

const MangaViewer = () => {
    const route = useRoute<RouteProp<Record<string, MangaViewerRouteParams>, string>>();
    const navigation = useNavigation<NavigationProps>();
    const chapterStore = useChapterStore();
    const scrollViewRef = useRef(null);

    const [currentProgress, setCurrentProgress] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentChapter, setCurrentChapter] = useState<iChapterData>({} as iChapterData);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [allImages, setAllImages] = useState<Array<any>>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [isTelaCheia, setIsTelaCheia] = useState(false);

    const loadAllPages = useCallback(async (chapterId: string) => {
        try {
            setIsLoading(true);
            setError(null);
            setAllImages([]);

            const total = await chapterStore.getQuantidadePaginasDoCapitulo(chapterId);
            setTotalPages(total);

            const loadPromises = Array.from({ length: total }, async (_, index) => {
                try {
                    return await chapterStore.getPaginaDoCapitulo(chapterId, index);
                } catch (error) {
                    console.error(`Erro ao carregar página ${index}:`, error);
                    return null;
                }
            });

            const images = await Promise.all(loadPromises);
            const validImages = images.filter(Boolean);
            setAllImages(validImages);

            if (validImages.length === 0) {
                console.warn('Nenhuma imagem válida carregada!');
                setError('Nenhuma imagem válida foi carregada para este capítulo.');
            }
        } catch (err) {
            console.error('Erro em loadAllPages:', err);
            const errorMsg = err instanceof Error ? err.message : "Erro ao carregar o capítulo";
            setError(errorMsg);
            Alert.alert("Erro", errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [chapterStore]);

    const nextPage = useCallback(() => {
        if (currentPageIndex < totalPages - 1)
            setCurrentPageIndex(prev => prev + 1);
    }, [currentPageIndex, totalPages]);

    const previousPage = useCallback(() => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(prev => prev - 1);
        }
    }, [currentPageIndex]);

    const handleImageError = useCallback(() => {
        const errorMsg = 'Failed to load image';
        setError(errorMsg);
        Alert.alert('Erro', errorMsg);
    }, []);

    const navigateToMangaDetail = useCallback(() => {
        navigation.navigate('Home');
    }, []);

    const handleChapterChange = useCallback(async (id: string, title = '', progress = 1) => {
        if (!id) {
            setError('Invalid chapter ID');
            setIsLoading(false);
            return;
        }

        setCurrentProgress(progress === 0 ? 1 : progress);

        await chapterStore.updateReadingProgress(id, progress);
        const chapter = await chapterStore.getReadingProgress(id);
        setCurrentChapter(chapter);

        await loadAllPages(id);
    }, [chapterStore, loadAllPages]);

    useEffect(() => {
        const id = route.params?.id ?? '';
        const title = route.params?.title ?? '';
        const progress = Number(route.params?.progress ?? 1);

        handleChapterChange(id, title, progress);
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
                <TouchableOpacity style={styles.btnBack} onPress={navigateToMangaDetail}>
                    <View style={styles.backIconWrapper}>
                        <Ionicons name="arrow-back" size={32} color="#fff" />
                    </View>
                </TouchableOpacity>

                {allImages.length > 0 && (
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.scrollViewContent}
                        onScrollEndDrag={(e) => {
                            const contentOffsetX = e.nativeEvent.contentOffset.x;
                            const index = Math.floor(contentOffsetX / width);
                            setCurrentPageIndex(index);
                        }}
                    >
                        {allImages.map((image, key) => (
                            <View key={key} style={styles.imageContainer}>
                                <Image
                                    source={{ uri: image }}
                                    style={styles.fullscreenImage}
                                    resizeMode="contain"
                                    onError={handleImageError}
                                />
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView style={styles.container}>
            <Modal
                visible={false}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalContainer}>
                    <Text>Finalizado!</Text>
                </View>
            </Modal>

            {renderContent()}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    scrollViewContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width - 40,
        height: height * 0.75,
        resizeMode: 'contain',
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
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    fullscreenImage: {
        width: width,
        height: height,
        resizeMode: 'contain',
        backgroundColor: '#000',
    },
    btnBack: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
    },
    backIconWrapper: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 25,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MangaViewer;