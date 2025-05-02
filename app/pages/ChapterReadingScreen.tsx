import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {Button} from "react-native-paper";
import iChapterData from '../_types/iChapter';
import useChapterStore from '@/app/stores/chapterStore';
import React, {useCallback, useEffect, useState} from 'react';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';

type NavigationProps = {
    navigate: (screen: string, params?: any) => void;
    addListener: any;
    dispatch: (action: any) => void;
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

const MangaScreen = () => {
    const route = useRoute<MangaScreenRouteProp>();
    const navigation = useNavigation<NavigationProps>();
    const chapterStore = useChapterStore();

    const [id, setId] = useState<string | undefined>(route.params?.id);
    const [isCarregandoProxima, setIsCarregandoProxima] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState<number>(1);
    const [isCarregando, setIsCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [capituloAtual, setCapituloAtual] = useState<iChapterData>({} as iChapterData);
    const [imagem, setImagem] = useState<string>('');
    const [totalPages, setTotalPages] = useState(0);
    const [imagemCarregada, setImagemCarregada] = useState(false);
    const [inicializacaoConcluida, setInicializacaoConcluida] = useState(false);

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
                setImagemCarregada(false);
                const imagePath = await chapterStore.getPaginaDoCapitulo(
                    chapterId,
                    pageNumber - 1
                );
                setImagem(imagePath);
                setImagemCarregada(true);

                if (totalPages > 0)
                    chapterStore.precarregarPaginas(chapterId, pageNumber, totalPages);
            } catch (error) {
                console.error(`Erro ao carregar página ${pageNumber}:`, error);
                setErro('Erro ao carregar a página.');
            }
        },
        [chapterStore, totalPages]);

    const proximaPagina = useCallback(() => {
        if (paginaAtual < totalPages) {
            const nextIndex = paginaAtual + 1;
            setPaginaAtual(nextIndex);
            setIsCarregandoProxima(true);
            carregaPaginaUnica(id, nextIndex).finally(() =>
                setIsCarregandoProxima(false)
            );
        }
    }, [paginaAtual, totalPages, id, carregaPaginaUnica]);

    const paginaAnterior = useCallback(() => {
        if (paginaAtual > 1) {
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
    }, [navigation]);

    const navegaParaTelaDetalhes = useCallback(() => {
        navigation.navigate('Home');
    }, [navigation]);

    const lidaMudancaCapitulo = useCallback(
        async (chapterId: string | undefined, initialPage: number) => {
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

                const validPage = Math.max(1, Math.min(initialPage, chapter.numberPages));
                setPaginaAtual(validPage);

                setImagem('');

                await carregaPaginaUnica(chapterId, validPage);
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
        const inicializarTela = async () => {
            if (route.params?.id) {
                setId(route.params.id);

                const paginaInicial = route.params.progress ?? 1;

                try {
                    await lidaMudancaCapitulo(route.params.id, paginaInicial);
                    setInicializacaoConcluida(true);
                } catch (error) {
                    console.error("Erro ao carregar o capítulo inicial:", error);
                    setErro("Erro ao carregar o capítulo inicial.");
                    setIsCarregando(false);
                }
            }
        };

        inicializarTela();
    }, [route.params]);

    useEffect(() => {
        const unsubscribeBeforeRemove = navigation.addListener(
            'beforeRemove',
            async (e: { preventDefault: () => void; data: { action: any; }; }) => {
                e.preventDefault();
                try {
                    await atualizaProgresso();
                    navigation.navigate("Home");
                } catch (error) {
                    console.error("Erro ao atualizar o progresso antes de sair:", error);
                    navigation.navigate("Home");
                }
            }
        );

        return () => {
            unsubscribeBeforeRemove();
        };
    }, [navigation, atualizaProgresso]);

    const renderContent = () => {
        if (isCarregando) {
            return (
                <ActivityIndicator size="large" color="#0000ff"/>
            );
        }

        if (erro) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{erro}</Text>
                    <Button onPress={navegaParaTelaDetalhes}>Voltar</Button>
                </View>
            );
        }

        return (
            <>
                <View style={styles.imageContainer}>
                    {!imagemCarregada && <ActivityIndicator size="large" color="#0000ff"/>}
                    {imagem ? (
                        <Image
                            source={{uri: imagem}}
                            style={[styles.image, !imagemCarregada && styles.hiddenImage]}
                            onLoad={() => setImagemCarregada(true)}
                            onError={lidaErroImagem}
                            resizeMode="contain"/>
                    ) : null}
                </View>
                <View style={styles.controls}>
                    <TouchableOpacity
                        onPress={paginaAnterior}
                        disabled={paginaAtual <= 1 || isCarregandoProxima}
                        style={[styles.navButton, (paginaAtual <= 1 || isCarregandoProxima) && styles.disabledButton]}
                    >
                        <Text>Anterior</Text>
                    </TouchableOpacity>

                    <Text style={styles.pageInfo}>
                        {paginaAtual} / {totalPages}
                    </Text>

                    <TouchableOpacity
                        onPress={proximaPagina}
                        disabled={paginaAtual >= totalPages || isCarregandoProxima}
                        style={[styles.navButton, (paginaAtual >= totalPages || isCarregandoProxima) && styles.disabledButton]}
                    >
                        <Text>Próxima</Text>
                    </TouchableOpacity>
                </View>
            </>
        );
    }

    return (
        <View style={styles.container}>
            {renderContent()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    hiddenImage: {
        opacity: 0,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    navButton: {
        padding: 10,
        backgroundColor: '#444',
        borderRadius: 5,
    },
    disabledButton: {
        opacity: 0.5,
    },
    pageInfo: {
        color: '#fff',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginBottom: 20,
    },
});

export default MangaScreen;