import { formatDate } from '@/utils/utils';
import { Ionicons } from '@expo/vector-icons';
import { iEpisodeVO } from '@/_types/iEpisodeVO';
import React, { useEffect, useState } from 'react';
import useEpisodeStore from "@/stores/episodeStore";
import { useRoute } from "@react-navigation/native";
import * as ScreenOrientation from 'expo-screen-orientation';
import EpisodeService from '@/class/services/EpisodeService';
import { FeedbackEpisodeType } from '@/enums/FeedbackEpisodeType';
import { ResizeMode, Video, VideoFullscreenUpdateEvent } from 'expo-av';
import { EpisodeCommentsVO } from '@/_types/screens/listing-animes/EpisodeCommentsVO';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const EpisodeDisplayScreen = () => {
    const route = useRoute<any>();
    const video = React.useRef(null);
    const episodeStore = useEpisodeStore();
    const [uri, setUri] = useState<string>("");
    const episodeService = new EpisodeService();
    const [comment, setComment] = useState<string>("");
    const [idEpisode, setIdEpisode] = useState<string>("");
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<FeedbackEpisodeType>(FeedbackEpisodeType.NOTHING);
    const [daysRelease, setDaysRelease] = useState<string>("");
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [episodeInfo, setEpisodeInfo] = useState<iEpisodeVO>({} as iEpisodeVO);
    const [comments, setComments] = useState<Array<EpisodeCommentsVO>>([] as Array<EpisodeCommentsVO>);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleEpisode = async (idEpisode: string) => {
        try {
            setIsLoading(true);
            const response = await episodeStore.getEpisode(idEpisode);

            setIdEpisode(idEpisode);
            setEpisodeInfo(response);
            const feedbackEnum = parseToEnumTypeFeedback(response.feedback);
            setFeedback(feedbackEnum);
            setDaysRelease(formatDate(response.uploaded));
            setComments(response.commentsList || []);

            setUri(`http://192.168.15.17:8080${response.uriEpisode}`);
        } catch (error) {
            console.error("Erro ao carregar episódio:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleUpdateViews = async (idEpisode: string) => {
            try {
                await episodeService.updateView(idEpisode);
            } catch (error) {
                console.error("Erro ao atualizar visualização do episódio:", error);
            }
        };

        const idEpisode = route.params.id;
        handleUpdateViews(idEpisode);
        handleEpisode(idEpisode);

        return () => {
            ScreenOrientation
                .lockAsync(ScreenOrientation.OrientationLock.DEFAULT)
                .catch((e) => console.warn('Erro ao resetar orientação:', e));
        };
    }, []);

    const handleFullscreenUpdate = async ({ fullscreenUpdate }: VideoFullscreenUpdateEvent) => {
        const PLAYER_WILL_PRESENT = 0;
        const PLAYER_WILL_DISMISS = 2;

        switch (fullscreenUpdate) {
            case PLAYER_WILL_PRESENT:
                setIsFullscreen(true);
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
                break;
            case PLAYER_WILL_DISMISS:
                setIsFullscreen(false);
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
                break;
        }
    };

    const parseToEnumTypeFeedback = (feedback: string): FeedbackEpisodeType => {
        if (feedback === "LIKE")
            return FeedbackEpisodeType.LIKE
        else if (feedback === "DISLIKE")
            return FeedbackEpisodeType.DISLIKE

        else return FeedbackEpisodeType.NOTHING;
    }

    const handleComment = async () => {
        if (!comment.trim()) return;

        try {
            setIsLoading(true);
            await episodeService.addComment(idEpisode, comment);
            setComment("");
            await handleEpisode(idEpisode);
        } catch (error) {
            console.error("Erro ao adicionar comentário:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFeedback = async (type: FeedbackEpisodeType) => {
        try {
            await episodeService.handleFeedback(idEpisode, type);
            await handleEpisode(idEpisode);
        } catch (error) {
            console.error("Erro ao adicionar feedback:", error);
        }
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.videoContainer}>
                <Video
                    ref={video}
                    source={{ uri: uri }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    style={styles.video}
                    onFullscreenUpdate={handleFullscreenUpdate}
                />
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.title}>
                    {episodeInfo.titleEpisode}
                </Text>

                <View style={styles.statsRow}>
                    <Text style={styles.stats}>{episodeInfo.amountViews} visualizações • Lançado em {daysRelease}</Text>
                </View>
            </View>

            <View style={styles.descriptionContainer}>
                <View style={styles.studioContainer}>
                    <Image
                        source={{ uri: "https://github.com/AndrewGPFranco.png" }}
                        style={styles.studioAvatar}
                    />
                    <View style={styles.studioInfo}>
                        <Text style={styles.studioName}>Animes e Mangás</Text>
                    </View>
                    <View style={styles.feedbackContainer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleFeedback(FeedbackEpisodeType.DISLIKE)}
                        >
                            <Ionicons
                                name={feedback === FeedbackEpisodeType.DISLIKE ? "thumbs-down" : "thumbs-down-outline"}
                                size={22}
                                color={feedback === FeedbackEpisodeType.DISLIKE ? "#FF6B6B" : "#AAAAAA"}
                            />
                            <Text style={[styles.actionText, feedback === FeedbackEpisodeType.DISLIKE && styles.actionTextActive]}>
                                {FeedbackEpisodeType.DISLIKE}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleFeedback(FeedbackEpisodeType.LIKE)}
                        >
                            <Ionicons
                                name={feedback === FeedbackEpisodeType.LIKE ? "thumbs-up" : "thumbs-up-outline"}
                                size={22}
                                color={feedback === FeedbackEpisodeType.LIKE ? "#FF6B6B" : "#AAAAAA"}
                            />
                            <Text style={[styles.actionText, feedback === FeedbackEpisodeType.LIKE && styles.actionTextActive]}>
                                {FeedbackEpisodeType.LIKE}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.commentsContainer}>
                <View style={styles.commentsHeader}>
                    <Text style={styles.commentsCount}>{comments.length} comentários</Text>
                </View>

                <View style={styles.addCommentContainer}>
                    <Image
                        source={{ uri: "https://github.com/AndrewGPFranco.png" }}
                        style={styles.commentAvatar}
                    />
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Adicione um comentário..."
                        placeholderTextColor="#777"
                        value={comment}
                        onChangeText={setComment}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !comment.trim() && styles.sendButtonDisabled]}
                        onPress={handleComment}
                        disabled={!comment.trim() || isLoading}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={!comment.trim() || isLoading ? "#555555" : "#6200EE"}
                        />
                    </TouchableOpacity>
                </View>

                {isLoading && comments.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Carregando comentários...</Text>
                    </View>
                ) : (
                    <>
                        {comments.length === 0 ? (
                            <View style={styles.noCommentsContainer}>
                                <Text style={styles.noCommentsText}>Nenhum comentário ainda. Seja o primeiro a comentar!</Text>
                            </View>
                        ) : (
                            comments.map((item, index) => (
                                <View key={`${item.comment}-${index}`} style={styles.commentItem}>
                                    <Image
                                        source={{ uri: "https://github.com/AndrewGPFranco.png" }}
                                        style={styles.commentAvatar}
                                    />
                                    <View style={styles.commentContent}>
                                        <View style={styles.commentHeader}>
                                            <Text style={styles.commentUser}>{item.nameUser}</Text>
                                        </View>
                                        <Text style={styles.commentText}>{item.comment}</Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000000',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#222222',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    stats: {
        fontSize: 14,
        color: '#888888',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    actionButton: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    actionText: {
        fontSize: 12,
        color: '#AAAAAA',
        marginTop: 4,
    },
    actionTextActive: {
        color: '#FF6B6B',
    },
    descriptionContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#222222',
    },
    studioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    studioAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    studioInfo: {
        flex: 1,
        marginLeft: 10,
    },
    studioName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subscriberCount: {
        fontSize: 14,
        color: '#888888',
    },
    subscribeButton: {
        backgroundColor: '#FF6B6B',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    subscribedButton: {
        backgroundColor: '#333333',
    },
    subscribeText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    subscribedText: {
        color: '#AAAAAA',
    },
    description: {
        fontSize: 14,
        color: '#DDDDDD',
        lineHeight: 20,
    },
    showMore: {
        color: '#888888',
        marginTop: 10,
        fontSize: 14,
    },
    commentsContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#222222',
    },
    commentsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        alignItems: 'center',
    },
    commentsCount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sortText: {
        color: '#AAAAAA',
        marginLeft: 5,
        fontSize: 14,
    },
    addCommentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    commentInput: {
        flex: 1,
        height: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
        marginLeft: 10,
        color: '#FFFFFF',
        paddingHorizontal: 10,
    },
    sendButton: {
        padding: 8,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    commentContent: {
        flex: 1,
        marginLeft: 10,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentUser: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    commentTime: {
        fontSize: 12,
        color: '#777777',
        marginLeft: 8,
    },
    commentText: {
        fontSize: 14,
        color: '#DDDDDD',
        marginTop: 4,
        lineHeight: 20,
    },
    commentAction: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    commentActionText: {
        fontSize: 12,
        color: '#AAAAAA',
        marginLeft: 4,
    },
    moreCommentsButton: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    moreCommentsText: {
        color: '#6200EE',
        fontSize: 14,
    },
    feedbackContainer: {
        flexDirection: 'row',
        gap: 30
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingMoreContainer: {
        padding: 10,
        alignItems: 'center',
    },
    loadingText: {
        color: '#AAAAAA',
        fontSize: 14,
    },
    noCommentsContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noCommentsText: {
        color: '#AAAAAA',
        fontSize: 14,
        textAlign: 'center',
    }
});

export default EpisodeDisplayScreen;