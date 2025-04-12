import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Dimensions,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {formatDate} from '@/app/utils/utils';
import {StatusType} from '@/app/enums/StatusType';
import useMangaStore from '@/app/stores/mangaStore';
import {Card} from 'react-native-paper';

export default function MangaDetails() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();

    const [manga, setManga] = useState<any>({});
    const [chapters, setChapters] = useState<any[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [isFormNota, setIsFormNota] = useState<boolean>(false);
    const [selectedChapter, setSelectedChapter] = useState<any>(null);

    const mangaStore = useMangaStore();

    useEffect(() => {
        const fetchManga = async () => {
            const title = Array.isArray(route.params.title)
                ? route.params.title[0]
                : route.params.title;

            const data = await mangaStore.getInfoManga(title);
            setManga(data);

            if (data.chapters) {
                setChapters([...data.chapters].sort((a, b) => a.title.localeCompare(b.title)));
            }
        };

        fetchManga();
    }, [route.params.title]);

    const verifyEndDate = (manga: any): string => {
        return manga.endDate ? formatDate(manga.endDate) : 'Still on display.';
    };

    const askContinueReading = (chapter: any) => {
        setSelectedChapter(chapter);
        setShowDialog(true);
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Image source={{uri: manga.image}} style={styles.image}/>
                        <View>
                            <Text style={styles.title}>{manga.title}</Text>
                            <TouchableOpacity
                                style={styles.accessButton}
                                onPress={() => setIsFormNota(true)}
                            >
                                <Text style={styles.buttonText}>Avaliar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.meta}>
                        <Text style={styles.metaText}><Text style={styles.bold}>Qtde. Capítulos:</Text> {manga.size}
                        </Text>
                        <Text style={styles.metaText}><Text style={styles.bold}>Gênero:</Text> {manga.gender}</Text>
                        <Text style={styles.metaText}><Text style={styles.bold}>Status:</Text> {manga.status}</Text>
                        <Text style={styles.metaText}><Text style={styles.bold}>Autor:</Text> {manga.author}</Text>
                        <Text style={styles.metaText}><Text style={styles.bold}>Data de
                            criação:</Text> {formatDate(manga.creationDate)}</Text>
                        <Text style={styles.metaText}><Text style={styles.bold}>Finalizado
                            em:</Text> {verifyEndDate(manga)}</Text>
                        <Text style={styles.metaText}><Text style={styles.bold}>Descrição:</Text> {manga.description}
                        </Text>
                    </View>

                    <Text style={styles.chapterHeader}>Capítulos</Text>

                    {chapters.map((chapter) => (
                        <View
                            key={chapter.id}
                            style={[
                                styles.chapterCard,
                                chapter.status === StatusType.FINISHED && {backgroundColor: '#D1FAE5'},
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() =>
                                    chapter.readingProgress !== 0
                                        ? askContinueReading(chapter)
                                        : navigation.navigate('ChapterReading', {
                                            id: chapter.id,
                                            title: manga.title,
                                            progress: 1,
                                        })
                                }
                            >
                                <Text style={[
                                    styles.chapterTitle,
                                    chapter.status === StatusType.FINISHED && {color: '#000'}
                                ]}>{chapter.title}</Text>
                            </TouchableOpacity>
                            <Text style={[
                                styles.metaText,
                                chapter.status === StatusType.FINISHED && {color: '#000'}
                            ]}>Páginas: {chapter.numberPages}</Text>
                            <Text style={[
                                styles.metaText,
                                chapter.status === StatusType.FINISHED && {color: '#000'}
                            ]}>
                                Progresso:{' '}
                                {chapter.status === StatusType.FINISHED
                                    ? 'Leitura finalizada'
                                    : chapter.readingProgress === 0
                                        ? 'Leitura não iniciada'
                                        : `Pág: ${chapter.readingProgress}`}
                            </Text>
                        </View>
                    ))}
                </ScrollView>

                <Modal visible={showDialog} transparent animationType="fade">
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>Deseja continuar de onde parou?</Text>
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.buttonConfirm}
                                    onPress={() => {
                                        setShowDialog(false);
                                        if (selectedChapter) {
                                            navigation.navigate('ChapterReading', {
                                                id: selectedChapter.id,
                                                title: manga.title,
                                                progress: selectedChapter.readingProgress,
                                            });
                                        }
                                    }}
                                >
                                    <Text style={styles.buttonText}>Sim</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.buttonCancel}
                                    onPress={() => {
                                        setShowDialog(false);
                                        if (selectedChapter) {
                                            navigation.navigate('ChapterReading', {
                                                id: selectedChapter.id,
                                                title: manga.title,
                                                progress: 1,
                                            });
                                        }
                                    }}
                                >
                                    <Text style={styles.buttonText}>Não</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal
                    visible={isFormNota}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setIsFormNota(false)}
                >
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>Formulário de Avaliação</Text>
                            <TouchableOpacity onPress={() => setIsFormNota(false)} style={styles.buttonCancel}>
                                // TODO: implementar
                                <Text style={styles.buttonText}>Fechar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#121212',
        padding: 15,
        flex: 1,
    },
    card: {
        backgroundColor: "#1E1E1E",
        borderRadius: 10,
        padding: 10,
        elevation: 3,
        height: Dimensions.get("screen").height * 0.93,
        maxHeight: Dimensions.get("screen").height,
    },
    header: {
        flexDirection: 'row',
        marginBottom: 24,
        alignItems: 'center',
    },
    image: {
        width: 96,
        height: 96,
        borderRadius: 12,
        marginRight: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        flexShrink: 1,
        color: '#FFFFFF',
    },
    meta: {
        marginBottom: 24,
    },
    metaText: {
        marginBottom: 6,
        fontSize: 16,
        color: '#CCCCCC',
    },
    bold: {
        fontWeight: '600',
        color: '#FFFFFF',
    },
    chapterHeader: {
        fontSize: 20,
        fontWeight: '600',
        borderBottomWidth: 1,
        borderBottomColor: '#FFFFFF',
        marginBottom: 16,
        paddingBottom: 6,
        color: '#FFFFFF',
    },
    chapterCard: {
        padding: 16,
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: '#333',
    },
    chapterTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
        color: '#FFFFFF',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: '90%',
        backgroundColor: '#2A2A2A',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
        color: '#FFFFFF',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 16,
    },
    buttonConfirm: {
        backgroundColor: '#16A34A',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    buttonCancel: {
        backgroundColor: '#4B5563',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 10,
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    accessButton: {
        marginTop: 15,
        width: '100%',
        backgroundColor: '#10b981',
        paddingVertical: 3,
        borderRadius: 8,
        alignItems: 'center',
    },
});