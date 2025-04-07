import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    Modal,
    Alert, Dimensions,
} from "react-native";
import {Card, Button} from "react-native-paper";
import useChapterStore from "@/app/stores/chapterStore";
import iChapterData from "../_types/iChapter";
import {useNavigation} from "expo-router";

type NavigationProps = {
    navigate: (screen: string, params?: any) => void;
};

const ProgressReadingScreen = () => {
    const navigation = useNavigation<NavigationProps>();
    const chapterStore = useChapterStore();

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

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Title titleStyle={{color: "#ffffff"}} title="Leituras em andamento"/>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Capítulos</Text>
                    <View style={styles.scrollWrapper}>
                        <FlatList
                            data={chapters}
                            keyExtractor={(item) => item.id.toString()}
                            numColumns={2}
                            contentContainerStyle={styles.gridContainer}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    style={styles.chapterCard}
                                    onPress={() => askContinueReading(item)}
                                >
                                    <Image
                                        source={{uri: item.urlImageManga}}
                                        style={styles.chapterImage}
                                    />
                                    <View style={styles.chapterInfo}>
                                        <Text style={styles.chapterTitle}>{item.title}</Text>
                                        <Text style={styles.chapterDetails}>Páginas: {item.numberPages}</Text>
                                        <Text style={styles.chapterDetails}>Progresso: {item.readingProgress}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
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
                        <Card.Title title="Continuar de onde parou?" titleStyle={{ color: "#ffffff" }} />
                        <Card.Content>
                            {selectedChapter && (
                                <View>
                                    <Text style={styles.modalText}>Capítulo: {selectedChapter.title}</Text>
                                    <Text style={styles.modalText}>Progresso: {selectedChapter.readingProgress}</Text>
                                </View>
                            )}
                            <View style={styles.modalButtons}>
                                <Button
                                    mode="contained"
                                    onPress={() => {
                                        setIsShowDialog(false);
                                        navigation.navigate("ChapterReading", {
                                            id: selectedChapter.id,
                                            progress: selectedChapter.readingProgress
                                        });
                                    }}
                                    style={styles.confirmButton}
                                >
                                    Sim
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={() => {
                                        setIsShowDialog(false);
                                        navigation.navigate("ChapterReading", {
                                            id: selectedChapter.id,
                                            progress: 1
                                        });
                                    }}
                                    style={styles.cancelButton}
                                >
                                    Não
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={async () => {
                                        setIsShowDialog(false);
                                        await progressReset();
                                    }}
                                >
                                    Resetar progresso
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
        backgroundColor: "#121212",
    },
    card: {
        backgroundColor: "#1e1e1e",
        borderRadius: 10,
        padding: 10,
        elevation: 3,
        height: Dimensions.get("screen").height * 0.93,
        maxHeight: Dimensions.get("screen").height,
        borderWidth: 1,
    },
    scrollWrapper: {
        maxHeight: Dimensions.get("screen").height * 0.80,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#ffffff",
    },
    gridContainer: {
        alignItems: "center",
    },
    chapterCard: {
        width: 160,
        backgroundColor: "#1e1e1e",
        borderRadius: 10,
        overflow: "hidden",
        margin: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#cccccc",
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
        color: "#ffffff",
    },
    chapterDetails: {
        fontSize: 14,
        color: "#cccccc",
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalCard: {
        width: 300,
        padding: 15,
        color: "#cccccc",
        backgroundColor: "#2c2c2c",
        borderRadius: 12,
        borderWidth: 1,
    },
    modalText: {
        color: "#ffffff",
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 10,
        marginTop: 20,
    },
    confirmButton: {
        backgroundColor: "#22c55e", // green-500
    },
    cancelButton: {
        backgroundColor: "#6b7280", // gray-500
    },
});
