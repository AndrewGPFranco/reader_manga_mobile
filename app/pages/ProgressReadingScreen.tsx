import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    Modal, Alert,
} from "react-native";
import useChapterStore from "@/stores/chapterStore";
import iChapterData from "@/_types/iChapter";
import {useNavigation} from "expo-router";
import {NavigationProps} from "@/_types/navigation/NavigationProps";

const ProgressReadingScreen = () => {
    const navigation = useNavigation<NavigationProps>();
    const chapterStore = useChapterStore();

    const [page, setPage] = useState(1);
    const [isShowDialog, setIsShowDialog] = useState(false);
    const [chapters, setChapters] = useState<iChapterData[]>([]);
    const [pageTotal, setPageTotal] = useState<number | undefined>(0);
    const [totalQuantidadePaginas, setTotalQuantidadePaginas] = useState<number>(0);
    const [totalALer, setTotalALer] = useState<number>(0);
    const [selectedChapter, setSelectedChapter] = useState<iChapterData>({} as iChapterData);

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const data = await chapterStore.getAllReadingProgress(page - 1);
                setChapters(data);
                setPageTotal(data.length > 0 ? data[0].numberPageOfPageable : 0);
            } catch (error) {
                console.error("Erro ao carregar os capítulos:", error);
            }
        };
        fetchChapters();
    }, [page]);

    useEffect(() => {
        const quantidadeTotalPaginas = quantidadeTotalPaginasParaLer();
        setTotalQuantidadePaginas(quantidadeTotalPaginas);
        setTotalALer(quantidadePaginasParaLer(quantidadeTotalPaginas));
    }, [chapters]);

    const progressReset = async () => {
        const result = await chapterStore.progressReset(selectedChapter.id);
        setChapters([]);
        Alert.alert(result);

        setChapters(await chapterStore.getAllReadingProgress(page - 1));
    }

    const askContinueReading = (chapter: iChapterData) => {
        setSelectedChapter(chapter);
        setIsShowDialog(true);
    };

    const quantidadePaginasParaLer = (quantidadeTotal: number): number => {
        chapters.forEach(chapter => {
            quantidadeTotal = quantidadeTotal - chapter.readingProgress;
        });
        return quantidadeTotal;
    }

    const quantidadeTotalPaginasParaLer = (): number => {
        let quantidade = 0;
        chapters.forEach(chapter => {
            quantidade = quantidade + chapter.numberPages;
        });

        return quantidade;
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Biblioteca</Text>
                <Text style={styles.headerSubtitle}>Suas leituras em andamento</Text>
            </View>

            <FlatList
                data={chapters}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{chapters?.length || 0}</Text>
                            <Text style={styles.statLabel}>Mangás</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>X</Text>
                            <Text style={styles.statLabel}>Dias seguidos</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{ totalALer }</Text>
                            <Text style={styles.statLabel}>Restante</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{ totalQuantidadePaginas }</Text>
                            <Text style={styles.statLabel}>Páginas</Text>
                        </View>
                    </View>
                }
                renderItem={({item}) => (
                    <TouchableOpacity
                        style={styles.mangaCard}
                        onPress={() => askContinueReading(item)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.imageContainer}>
                            <Image
                                source={{uri: item.urlImageManga}}
                                style={styles.mangaImage}
                            />
                            <View style={styles.progressBarContainer}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        {width: `${item.readingProgress / item.numberPages * 100}%`}
                                    ]}
                                />
                            </View>
                        </View>
                        <View style={styles.mangaInfo}>
                            <Text style={styles.mangaTitle} numberOfLines={1} ellipsizeMode="tail">
                                {item.title}
                            </Text>
                            <View style={styles.detailsRow}>
                                <Text style={styles.mangaDetails}>
                                    {item.readingProgress}/{item.numberPages}
                                </Text>
                                <View style={styles.progressPercentage}>
                                    <Text style={styles.percentageText}>
                                        {Math.round(item.readingProgress / item.numberPages * 100)}%
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />

            <Modal
                visible={isShowDialog}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsShowDialog(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Continuar Leitura</Text>
                        </View>

                        {selectedChapter && (
                            <View style={styles.modalContent}>
                                <Image
                                    source={{uri: selectedChapter.urlImageManga}}
                                    style={styles.modalImage}
                                />
                                <View style={styles.modalInfo}>
                                    <Text style={styles.modalMangaTitle}
                                          numberOfLines={2}>{selectedChapter.title}</Text>
                                    <Text
                                        style={styles.modalProgressText}>Página {selectedChapter.readingProgress} de {selectedChapter.numberPages}</Text>
                                    <View style={styles.modalProgressBar}>
                                        <View
                                            style={[
                                                styles.modalProgressFill,
                                                {width: `${parseInt(String(selectedChapter.readingProgress)) / parseInt(String(selectedChapter.numberPages)) * 100}%`}
                                            ]}
                                        />
                                    </View>
                                </View>
                            </View>
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.continueButton}
                                onPress={() => {
                                    setIsShowDialog(false);
                                    navigation.navigate("ChapterReading", {
                                        id: selectedChapter.id,
                                        progress: selectedChapter.readingProgress
                                    });
                                }}
                            >
                                <Text style={styles.continueButtonText}>Continuar leitura</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.restartButton}
                                onPress={() => {
                                    setIsShowDialog(false);
                                    navigation.navigate("ChapterReading", {
                                        id: selectedChapter.id,
                                        progress: 1
                                    });
                                }}
                            >
                                <Text style={styles.restartButtonText}>Começar do início</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={async () => {
                                    setIsShowDialog(false);
                                    await progressReset();
                                }}
                            >
                                <Text style={styles.resetButtonText}>Resetar progresso</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ProgressReadingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        padding: 10
    },
    backgroundImage: {
        flex: 1,
        padding: 16,
    },
    headerContainer: {
        marginTop: 40,
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#ffffff",
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: "#cccccc",
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: "rgba(30, 30, 30, 0.85)",
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#FF4D94",
    },
    statItem: {
        alignItems: "center",
    },
    statNumber: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#ffffff",
    },
    statLabel: {
        fontSize: 12,
        color: "#cccccc",
        marginTop: 4,
    },
    gridContainer: {
        paddingBottom: 30,
    },
    mangaCard: {
        flex: 1,
        margin: 8,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(30, 30, 30, 0.8)',
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    imageContainer: {
        position: 'relative',
        height: 220,
    },
    mangaImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    progressBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FF4D94',
    },
    mangaInfo: {
        padding: 12,
    },
    mangaTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 6,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mangaDetails: {
        fontSize: 12,
        color: "#cccccc",
    },
    progressPercentage: {
        backgroundColor: 'rgba(255, 77, 148, 0.2)',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 10,
    },
    percentageText: {
        fontSize: 10,
        color: "#FF4D94",
        fontWeight: "bold",
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
    modalCard: {
        width: '85%',
        maxWidth: 360,
        backgroundColor: "#1e1e1e",
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: "#333333",
    },
    modalHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#333333",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#ffffff",
        textAlign: "center",
    },
    modalContent: {
        flexDirection: 'row',
        padding: 16,
    },
    modalImage: {
        width: 80,
        height: 120,
        borderRadius: 8,
    },
    modalInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    modalMangaTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 8,
    },
    modalProgressText: {
        fontSize: 14,
        color: "#cccccc",
        marginBottom: 8,
    },
    modalProgressBar: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    modalProgressFill: {
        height: '100%',
        backgroundColor: '#FF4D94',
        borderRadius: 3,
    },
    modalButtons: {
        padding: 16,
    },
    continueButton: {
        backgroundColor: "#FF4D94",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    continueButtonText: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 16,
    },
    restartButton: {
        backgroundColor: "#333333",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    restartButtonText: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 16,
    },
    resetButton: {
        backgroundColor: "transparent",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: "#666666",
    },
    resetButtonText: {
        color: "#cccccc",
        fontSize: 16,
    }
});