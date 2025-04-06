import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
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
    addListener: any;
};

type MangaViewerRouteParams = {
    id?: string;
    title?: string;
    progress?: number | string;
};

const { width, height } = Dimensions.get('screen');

const MangaScreen = () => {
    const route = useRoute<RouteProp<Record<string, MangaViewerRouteParams>, string>>();
    const navigation = useNavigation<NavigationProps>();
    const chapterStore = useChapterStore();

    const [id, setId] = useState<number | string>();
    const [isCarregandoProxima, setIsCarregandoProxima] = useState(false);
    const [progressoAtual, setProgressoAtual] = useState(1);
    const [isCarregando, setIsCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [capituloAtual, setCapituloAtual] = useState<iChapterData>({} as iChapterData);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [todasImagens, setTodasImagens] = useState<Array<any>>([]);
    const [totalPages, setTotalPages] = useState(0);

    const atualizaProgresso = useCallback(async () => {
        if (
            capituloAtual?.status !== 'FINISHED' &&
            progressoAtual > capituloAtual.readingProgress &&
            id
        ) {
            let idCapitulo = String(id);
            await chapterStore.updateReadingProgress(idCapitulo, progressoAtual);
        }
    }, [capituloAtual, progressoAtual, id, chapterStore]);

    const carregaPaginaUnica = useCallback(async (chapterId: any, pageNumber: number) => {
        try {
            const imagePath = await chapterStore.getPaginaDoCapitulo(chapterId, pageNumber);
            setTodasImagens(prev => [...prev, imagePath]);
        } catch (error) {
            console.error(`Erro ao carregar página ${pageNumber}:`, error);
        }
    }, [chapterStore]);

    const proximaPagina = useCallback(() => {
        if (paginaAtual < totalPages - 1) {
            const nextIndex = paginaAtual + 1;
            setPaginaAtual(nextIndex);

            if (!isCarregandoProxima && nextIndex === todasImagens.length && todasImagens.length < totalPages) {
                setIsCarregandoProxima(true);
                carregaPaginaUnica(id, todasImagens.length).finally(() => setIsCarregandoProxima(false));
            }
        }
    }, [paginaAtual, totalPages, todasImagens, id, isCarregandoProxima, carregaPaginaUnica]);

    const paginaAnterior = useCallback(() => {
        if (paginaAtual > 0) {
            setPaginaAtual(prev => prev - 1);
        }
    }, [paginaAtual]);

    const lidaErroImagem = useCallback(() => {
        const errorMsg = 'Failed to load image';
        setErro(errorMsg);
        Alert.alert('Erro', errorMsg);
    }, []);

    const navegaParaTelaDetalhes = useCallback(() => {
        navigation.navigate('Home');
    }, [navigation]);

    const lidaMudancaCapitulo = useCallback(async (id: string, title: string, progress: number) => {
        if (!id) {
            setErro('Invalid chapter ID');
            setIsCarregando(false);
            return;
        }

        setProgressoAtual(progress === 0 ? 1 : progress);
        await chapterStore.updateReadingProgress(id, progress);
        const chapter = await chapterStore.getReadingProgress(id);
        setCapituloAtual(chapter);

        const total = await chapterStore.getQuantidadePaginasDoCapitulo(id);
        setTotalPages(total);
        setTodasImagens([]);
        await carregaPaginaUnica(id, progress);
        setIsCarregando(false);
    }, [chapterStore, carregaPaginaUnica]);

    useEffect(() => {
        const id = route.params?.id ?? '';
        const title = route.params?.title ?? '';
        const progress = Number(route.params?.progress ?? 1);

        setId(id);
        lidaMudancaCapitulo(id, title, progress);
    }, [route.params, lidaMudancaCapitulo]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            atualizaProgresso();
        });

        return unsubscribe;
    }, [navigation, atualizaProgresso]);

    useEffect(() => {
        return () => {
            atualizaProgresso();
        };
    }, [atualizaProgresso]);

    const renderizaConteudo = () => {
        if (isCarregando) {
            return (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#BB86FC" />
                </View>
            );
        }

        if (erro) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{erro}</Text>
                </View>
            );
        }

        return (
            <View style={styles.contentContainer}>
                <TouchableOpacity style={styles.btnBack} onPress={async () => {
                    await atualizaProgresso();
                    navegaParaTelaDetalhes();
                }}>
                    <View style={styles.backIconWrapper}>
                        <Ionicons name="arrow-back" size={32} color="#fff" />
                    </View>
                </TouchableOpacity>

                {todasImagens.length > 0 && (
                    <View style={styles.imageWrapper}>
                        <Image
                            source={{ uri: todasImagens[paginaAtual] }}
                            style={styles.fullscreenImage}
                            resizeMode="contain"
                            onError={lidaErroImagem}
                        />
                        <View style={styles.navigationButtons}>
                            <TouchableOpacity
                                style={[styles.navButton, paginaAtual === 0 && styles.disabledButton]}
                                onPress={paginaAnterior}
                                disabled={paginaAtual === 0}
                            >
                                <Ionicons name="chevron-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.pageIndicator}>
                                {paginaAtual + 1} / {totalPages}
                            </Text>
                            <TouchableOpacity
                                style={[styles.navButton, paginaAtual === totalPages - 1 && styles.disabledButton]}
                                onPress={proximaPagina}
                                disabled={paginaAtual === totalPages - 1}
                            >
                                <Ionicons name="chevron-forward" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
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

            {renderizaConteudo()}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
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
        height: height * 0.85,
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
    imageWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: width,
    },
    navigationButtons: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: width * 0.9,
    },
    navButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 10,
        borderRadius: 25,
    },
    disabledButton: {
        opacity: 0.5,
    },
    pageIndicator: {
        color: '#fff',
        fontSize: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 5,
        borderRadius: 10,
    },
});

export default MangaScreen;