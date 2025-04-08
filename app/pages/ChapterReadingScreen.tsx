import React, {useCallback, useEffect, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
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
    progress?: number;
};

type MangaScreenRouteProp = RouteProp<
    Record<string, MangaViewerRouteParams>,
    string
>;

const {width, height} = Dimensions.get('screen');

const MangaScreen = () => {
    const route = useRoute<MangaScreenRouteProp>();
    const navigation = useNavigation<NavigationProps>();
    const chapterStore = useChapterStore();

    const [id, setId] = useState<string | undefined>(route.params?.id);
    const [progress, setProgress] = useState<number>(1);
    const [isCarregandoProxima, setIsCarregandoProxima] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState<number>(1);
    const [isCarregando, setIsCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [capituloAtual, setCapituloAtual] = useState<iChapterData>(
        {} as iChapterData
    );
    const [imagem, setImagem] = useState<string>('');
    const [totalPages, setTotalPages] = useState(0);

    const atualizaProgresso = useCallback(async () => {
        if (capituloAtual?.status !== 'FINISHED' && id) {
            await chapterStore.updateReadingProgress(id, paginaAtual);
        }
    }, [capituloAtual, paginaAtual, id, chapterStore]);

    const carregaPaginaUnica = useCallback(
        async (chapterId: string | undefined, pageNumber: number) => {
            if (!chapterId) {
                console.error('Chapter ID is undefined');
                return;
            }
            try {
                const imagePath = await chapterStore.getPaginaDoCapitulo(
                    chapterId,
                    pageNumber - 1
                );
                setImagem(imagePath);
            } catch (error) {
                console.error(`Erro ao carregar página ${pageNumber}:`, error);
                setErro('Erro ao carregar a página.');
            }
        },
        [chapterStore, id]);

    const proximaPagina = useCallback(() => {
        if (paginaAtual <= totalPages - 1) {
            const nextIndex = paginaAtual + 1;
            setPaginaAtual(nextIndex);
            setIsCarregandoProxima(true);
            carregaPaginaUnica(id, nextIndex).finally(() =>
                setIsCarregandoProxima(false)
            );
        }
    }, [paginaAtual, totalPages, id, carregaPaginaUnica]);

    const paginaAnterior = useCallback(() => {
        if (paginaAtual > 0) {
            const nextIndex = paginaAtual - 1;
            setPaginaAtual(nextIndex);
            setIsCarregandoProxima(true);
            carregaPaginaUnica(id, nextIndex).finally(() =>
                setIsCarregandoProxima(false)
            );
        }
    }, [paginaAtual, id, carregaPaginaUnica]);

    const lidaErroImagem = useCallback(() => {
        const errorMsg = 'Falha ao carregar a imagem.';
        setErro(errorMsg);
        Alert.alert('Erro', errorMsg);
        navigation.navigate("Home");
    }, []);

    const navegaParaTelaDetalhes = useCallback(() => {
        navigation.navigate('Home');
    }, [navigation]);

    const lidaMudancaCapitulo = useCallback(
        async (chapterId: string | undefined, progress: number) => {
            if (!chapterId) {
                setErro('ID do capítulo inválido.');
                setIsCarregando(false);
                return;
            }

            setIsCarregando(true);
            setErro(null);

            try {
                const chapter = await chapterStore.getReadingProgress(chapterId);
                setCapituloAtual(chapter);
                setTotalPages(chapter.numberPages);

                const validProgress = Math.min(Math.max(0, progress), chapter.numberPages - 1);
                setPaginaAtual(validProgress);
                setImagem('');
                await carregaPaginaUnica(chapterId, validProgress);
            } catch (e) {
                console.error('Erro ao carregar capítulo:', e);
                setErro('Erro ao carregar o capítulo.');
            } finally {
                setIsCarregando(false);
            }
        },
        [chapterStore, carregaPaginaUnica]
    );

    useEffect(() => {
        (async () => {
            if (route.params?.id && route.params?.progress) {
                setId(route.params.id);
                const progressoInicial = route.params.progress;
                setProgress(progressoInicial);
                try {
                    await lidaMudancaCapitulo(route.params.id, progressoInicial);
                } catch (error) {
                    console.error("Erro ao carregar o capítulo inicial:", error);
                    setErro("Erro ao carregar o capítulo inicial.");
                    setIsCarregando(false);
                }
            }
        })();
    }, [route.params, lidaMudancaCapitulo]);

    useEffect(() => {
        const unsubscribeBeforeRemove = navigation.addListener(
            'beforeRemove',
            async (e: { preventDefault: () => void; data: { action: any; }; }) => {
                e.preventDefault();
                try {
                    await atualizaProgresso();
                } catch (error) {
                    console.error("Erro ao atualizar o progresso antes de sair:", error);
                }
            }
        );

        return () => {
            unsubscribeBeforeRemove();
        };
    }, [navigation, atualizaProgresso]);

    const renderizaConteudo = () => {
        if (isCarregando) {
            return (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#BB86FC"/>
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
                <TouchableOpacity
                    style={styles.btnBack}
                    onPress={async () => {
                        await atualizaProgresso();
                        navegaParaTelaDetalhes();
                    }}
                >
                    <View style={styles.backIconWrapper}>
                        <Ionicons name="arrow-back" size={32} color="#fff"/>
                    </View>
                </TouchableOpacity>

                {imagem.length > 0 && (
                    <View style={styles.imageWrapper}>
                        <Image
                            source={{uri: imagem}}
                            style={styles.fullscreenImage}
                            resizeMode="contain"
                            onError={lidaErroImagem}
                        />
                        <View style={styles.navigationButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.navButton,
                                    paginaAtual === 1 && styles.disabledButton,
                                ]}
                                onPress={paginaAnterior}
                                disabled={paginaAtual === 1}
                            >
                                <Ionicons name="chevron-back" size={24} color="#fff"/>
                            </TouchableOpacity>
                            <Text style={styles.pageIndicator}>
                                {paginaAtual} / {totalPages}
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.navButton,
                                    paginaAtual >= totalPages && styles.disabledButton,
                                ]}
                                onPress={proximaPagina}
                                disabled={paginaAtual >= totalPages}
                            >
                                <Ionicons name="chevron-forward" size={24} color="#fff"/>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Modal visible={false} transparent={true} animationType="fade">
                <View style={styles.modalContainer}>
                    <Text>Finalizado!</Text>
                </View>
            </Modal>

            {renderizaConteudo()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        width: '100%',
        height: '100%',
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
        width: '100%',
        height: '100%',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: '100%',
        height: '100%',
    },
    fullscreenImage: {
        width: width,
        height: height * 1.1,
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
        height: height,
        overflow: 'hidden',
    },
    navigationButtons: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: width * 0.9,
        zIndex: 10,
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