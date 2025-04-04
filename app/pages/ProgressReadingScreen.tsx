import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    Modal,
} from "react-native";
import { Card, Button } from "react-native-paper";
import useChapterStore from "@/app/stores/chapterStore";
import iChapterData from "../_types/iChapter";
import { useNavigation } from "expo-router";
import { RouteProp, useRoute } from "@react-navigation/native";

type NavigationProps = {
    navigate: (screen: string, params?: any) => void;
};

type MangaViewerRouteParams = {
    id?: string;
    title?: string;
    progress?: number | string;
};

const ProgressReadingScreen = () => {
    const navigation = useNavigation<NavigationProps>();
    const chapterStore = useChapterStore();
    const route = useRoute<RouteProp<Record<string, MangaViewerRouteParams>, string>>();

    const [chapters, setChapters] = useState<iChapterData[]>([]);
    const [page, setPage] = useState(1);
    const [pageTotal, setPageTotal] = useState<number | undefined>(0);
    const [isShowDialog, setIsShowDialog] = useState(false);
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

    const askContinueReading = (chapter: iChapterData) => {
        setSelectedChapter(chapter);
        setIsShowDialog(true);
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Title title="Leituras em andamento" />
                <Card.Content>
                    <Text style={styles.sectionTitle}>Capítulos</Text>
                    <FlatList
                        data={chapters}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        contentContainerStyle={styles.gridContainer}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.chapterCard}
                                onPress={() => askContinueReading(item)} // Ao pressionar, chama a função
                            >
                                <Image
                                    source={{ uri: item.urlImageManga }}
                                    style={styles.chapterImage}
                                />
                                <View style={styles.chapterInfo}>
                                    <Text style={styles.chapterTitle}>{item.title}</Text>
                                    <Text style={styles.chapterDetails}>
                                        Páginas: {item.numberPages}
                                    </Text>
                                    <Text style={styles.chapterDetails}>
                                        Progresso: {item.readingProgress}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </Card.Content>
            </Card>

            <Modal
                visible={isShowDialog}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsShowDialog(false)}
            >
                <View style={styles.modalBackground}>
                    <Card style={styles.modalCard}>
                        <Card.Title title="Deseja continuar de onde parou?" />
                        <Card.Content>
                            {selectedChapter && ( // Verifica se existe um capítulo selecionado
                                <View>
                                    <Text>Capítulo: {selectedChapter.title}</Text>
                                    <Text>Progresso: {selectedChapter.readingProgress}</Text>
                                </View>
                            )}
                            <View style={styles.modalButtons}>
                                <Button
                                    mode="contained"
                                    onPress={() => {
                                        setIsShowDialog(false);
                                        navigation.navigate("ChapterReading", { id: selectedChapter.id });
                                    }}
                                    style={styles.confirmButton}
                                >
                                    Sim
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={() => {
                                        setIsShowDialog(false);
                                    }}
                                    style={styles.cancelButton}
                                >
                                    Não
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
                </View>
            </Modal>
        </View>
    );
};

export default ProgressReadingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "#f5f5f5",
    },
    card: {
        flex: 1,
        padding: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    gridContainer: {
        alignItems: "center",
    },
    chapterCard: {
        width: 160,
        backgroundColor: "white",
        borderRadius: 10,
        overflow: "hidden",
        margin: 8,
        elevation: 3,
    },
    chapterImage: {
        width: "100%",
        height: 200,
    },
    chapterInfo: {
        padding: 10,
    },
    chapterTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    chapterDetails: {
        fontSize: 14,
        color: "#666",
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalCard: {
        width: 300,
        padding: 15,
        backgroundColor: "white",
        borderRadius: 12,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 20,
    },
    confirmButton: {
        backgroundColor: "#16a34a",
    },
    cancelButton: {
        backgroundColor: "#4b5563",
    },
});
