import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    Modal,
    StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import { formatDate } from '@/app/utils/utils';
import { StatusType } from '@/app/enums/StatusType';
import useMangaStore from '@/app/stores/mangaStore';

export default function MangaDetails() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();

    const [manga, setManga] = useState<any>({});
    const [chapters, setChapters] = useState<any[]>([]);
    const [showDialog, setShowDialog] = useState(false);
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
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Image source={{ uri: manga.image }} style={styles.image} />
                <Text style={styles.title}>{manga.title}</Text>
            </View>

            <View style={styles.meta}>
                <Text style={styles.metaText}><Text style={styles.bold}>Qtde. Capítulos:</Text> {manga.size}</Text>
                <Text style={styles.metaText}><Text style={styles.bold}>Gênero:</Text> {manga.gender}</Text>
                <Text style={styles.metaText}><Text style={styles.bold}>Status:</Text> {manga.status}</Text>
                <Text style={styles.metaText}><Text style={styles.bold}>Autor:</Text> {manga.author}</Text>
                <Text style={styles.metaText}><Text style={styles.bold}>Data de criação:</Text> {formatDate(manga.creationDate)}</Text>
                <Text style={styles.metaText}><Text style={styles.bold}>Finalizado em:</Text> {verifyEndDate(manga)}</Text>
                <Text style={styles.metaText}><Text style={styles.bold}>Descrição:</Text> {manga.description}</Text>
            </View>

            <Text style={styles.chapterHeader}>Capítulos</Text>

            {chapters.map((chapter) => (
                <View
                    key={chapter.id}
                    style={[
                        styles.chapterCard,
                        chapter.status === StatusType.FINISHED && { backgroundColor: '#D1FAE5' },
                    ]}
                >
                    {chapter.readingProgress !== 0 ? (
                        <TouchableOpacity onPress={() => askContinueReading(chapter)}>
                            <Text style={styles.chapterTitle}>{chapter.title}</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate('ChapterReading', {
                                    id: chapter.id,
                                    title: manga.title,
                                    progress: 1,
                                })
                            }
                        >
                            <Text style={styles.chapterTitle}>{chapter.title}</Text>
                        </TouchableOpacity>
                    )}
                    <Text style={styles.metaText}>Páginas: {chapter.numberPages}</Text>
                    <Text style={styles.metaText}>
                        Progresso:{' '}
                        {chapter.status === StatusType.FINISHED
                            ? 'Leitura finalizada'
                            : chapter.readingProgress === 0
                                ? 'Leitura não iniciada'
                                : `Pág: ${chapter.readingProgress}`}
                    </Text>
                </View>
            ))}

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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 20,
        flex: 1,
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
    },
    meta: {
        marginBottom: 24,
    },
    metaText: {
        marginBottom: 6,
        fontSize: 16,
    },
    bold: {
        fontWeight: '600',
    },
    chapterHeader: {
        fontSize: 20,
        fontWeight: '600',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginBottom: 16,
        paddingBottom: 6,
    },
    chapterCard: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    chapterTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
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
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});