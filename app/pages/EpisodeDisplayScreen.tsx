import { formatDate } from '@/utils/utils';
import { FontAwesome5 } from '@expo/vector-icons';
import { iEpisodeVO } from '@/_types/iEpisodeVO';
import React, { useEffect, useState } from 'react';
import useEpisodeStore from "@/stores/episodeStore";
import { useRoute } from "@react-navigation/native";
import * as ScreenOrientation from 'expo-screen-orientation';
import EpisodeService from '@/class/services/EpisodeService';
import { FeedbackEpisodeType } from '@/enums/FeedbackEpisodeType';
import { ResizeMode, Video, VideoFullscreenUpdateEvent } from 'expo-av';
import { EpisodeCommentsVO } from '@/_types/screens/listing-animes/EpisodeCommentsVO';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Animated,
    StatusBar,
    ImageBackground,
    Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
    const [isSendingComment, setIsSendingComment] = useState<boolean>(false);

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const translateY = React.useRef(new Animated.Value(50)).current;

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

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]).start();
        } catch (error) {
            console.error("Erro ao carregar episódio:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        StatusBar.setBarStyle('light-content');

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
            StatusBar.setBarStyle('default');
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
        if (!comment.trim() || isSendingComment) return;

        try {
            setIsSendingComment(true);
            await episodeService.addComment(idEpisode, comment);
            setComment("");
            await handleEpisode(idEpisode);
        } catch (error) {
            console.error("Erro ao adicionar comentário:", error);
        } finally {
            setIsSendingComment(false);
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

    if (isLoading && !episodeInfo.titleEpisode) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator size="large" color="#FF5F6D" />
                <Text style={styles.loadingText}>Carregando episódio...</Text>
            </View>
        );
    }

    return (
        <ImageBackground
            source={require('@/assets/images/bg.jpg')}
            style={styles.backgroundImage}
        >
            <ScrollView style={styles.container}>
                <View style={styles.videoContainer}>
                    <Video
                        ref={video}
                        source={{ uri: uri }}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        style={styles.video}
                        onFullscreenUpdate={handleFullscreenUpdate}
                        posterSource={{ uri: episodeInfo.thumbnailUrl }}
                        usePoster={true}
                        posterStyle={styles.posterStyle}
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent']}
                        style={styles.videoOverlay}
                        pointerEvents="none"
                    />
                </View>

                <Animated.View
                    style={[
                        styles.infoContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: translateY }]
                        }
                    ]}
                >
                    <BlurView intensity={40} tint="dark" style={styles.glassEffect}>
                        <Text style={styles.title}>
                            {episodeInfo.titleEpisode}
                        </Text>

                        <View style={styles.statsRow}>
                            <View style={styles.statsItem}>
                                <FontAwesome5 name="eye" size={14} color="#FF5F6D" />
                                <Text style={styles.stats}>{episodeInfo.amountViews} visualizações</Text>
                            </View>
                            <View style={styles.separator} />
                            <View style={styles.statsItem}>
                                <FontAwesome5 name="calendar-alt" size={14} color="#FF5F6D" />
                                <Text style={styles.stats}>Lançado em {daysRelease}</Text>
                            </View>
                        </View>
                    </BlurView>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.descriptionContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: translateY }]
                        }
                    ]}
                >
                    <BlurView intensity={30} tint="dark" style={styles.glassEffect}>
                        <View style={styles.studioContainer}>
                            <Image
                                source={require('@/assets/images/profile.jpg')}
                                style={styles.studioAvatar}
                            />
                            <View style={styles.studioInfo}>
                                <Text style={styles.studioName}>Animes e Mangás</Text>
                                <Text style={styles.studioTagline}>Seu portal de anime favorito</Text>
                            </View>
                        </View>

                        <View style={styles.separator} />

                        <View style={styles.feedbackContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    feedback === FeedbackEpisodeType.LIKE && styles.actionButtonActive
                                ]}
                                onPress={() => handleFeedback(FeedbackEpisodeType.LIKE)}
                            >
                                <FontAwesome5
                                    name="heart"
                                    size={20}
                                    color={feedback === FeedbackEpisodeType.LIKE ? "#FF5F6D" : "#AAAAAA"}
                                    solid={feedback === FeedbackEpisodeType.LIKE}
                                />
                                <Text style={[styles.actionText, feedback === FeedbackEpisodeType.LIKE && styles.actionTextActive]}>
                                    Gostei
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    feedback === FeedbackEpisodeType.DISLIKE && styles.actionButtonActive
                                ]}
                                onPress={() => handleFeedback(FeedbackEpisodeType.DISLIKE)}
                            >
                                <FontAwesome5
                                    name="thumbs-down"
                                    size={20}
                                    color={feedback === FeedbackEpisodeType.DISLIKE ? "#5C80FF" : "#AAAAAA"}
                                    solid={feedback === FeedbackEpisodeType.DISLIKE}
                                />
                                <Text style={[styles.actionText, feedback === FeedbackEpisodeType.DISLIKE && styles.actionTextActiveBlue]}>
                                    Não Gostei
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.commentsContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: translateY }]
                        }
                    ]}
                >
                    <BlurView intensity={30} tint="dark" style={styles.glassEffect}>
                        <View style={styles.commentsHeader}>
                            <Text style={styles.commentsCount}>
                                <FontAwesome5 name="comment" size={16} color="#FF5F6D" solid /> {" "}
                                {comments.length} comentários
                            </Text>
                        </View>

                        <View style={styles.addCommentContainer}>
                            <Image
                                source={{ uri: "https://github.com/AndrewGPFranco.png" }}
                                style={styles.commentAvatar}
                            />
                            <TextInput
                                style={styles.commentInput}
                                placeholder="O que você achou desse episódio?"
                                placeholderTextColor="#999"
                                value={comment}
                                onChangeText={setComment}
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, !comment.trim() && styles.sendButtonDisabled]}
                                onPress={handleComment}
                                disabled={!comment.trim() || isSendingComment}
                            >
                                {isSendingComment ? (
                                    <ActivityIndicator size="small" color="#FF5F6D" />
                                ) : (
                                    <FontAwesome5
                                        name="paper-plane"
                                        size={18}
                                        color={!comment.trim() ? "#555555" : "#FF5F6D"}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>

                        {isLoading && comments.length === 0 ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#FF5F6D" />
                                <Text style={styles.loadingText}>Carregando comentários...</Text>
                            </View>
                        ) : (
                            <>
                                {comments.length === 0 ? (
                                    <View style={styles.noCommentsContainer}>
                                        <FontAwesome5 name="comment-slash" size={30} color="#666" />
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
                                                    <View style={styles.userBadge}>
                                                        <Text style={styles.userBadgeText}>Otaku</Text>
                                                    </View>
                                                </View>
                                                <Text style={styles.commentText}>{item.comment}</Text>
                                                <View style={styles.commentActions}>
                                                    <TouchableOpacity style={styles.commentAction}>
                                                        <FontAwesome5 name="heart" size={14} color="#AAAAAA" />
                                                        <Text style={styles.commentActionText}>Curtir</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.commentAction}>
                                                        <FontAwesome5 name="reply" size={14} color="#AAAAAA" />
                                                        <Text style={styles.commentActionText}>Responder</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </>
                        )}
                    </BlurView>
                </Animated.View>

                <View style={styles.spacer} />
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
    },
    container: {
        flex: 1,
        backgroundColor: 'rgba(18, 18, 36, 0.85)',
    },
    loadingScreen: {
        flex: 1,
        backgroundColor: '#121224',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FF5F6D',
        marginTop: 15,
        fontSize: 16,
        fontWeight: '600',
    },
    glassEffect: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000000',
        position: 'relative',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    posterStyle: {
        resizeMode: 'cover',
    },
    videoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        zIndex: 1,
    },
    infoContainer: {
        margin: 15,
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
        padding: 15,
        paddingBottom: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    statsRow: {
        flexDirection: 'row',
        padding: 15,
        paddingTop: 5,
        alignItems: 'center',
    },
    statsItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stats: {
        fontSize: 14,
        color: '#D4D4D4',
        marginLeft: 6,
    },
    separator: {
        width: 1,
        height: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 15,
    },
    descriptionContainer: {
        margin: 15,
        marginTop: 0,
        marginBottom: 10,
    },
    studioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    studioAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#FF5F6D',
    },
    studioInfo: {
        flex: 1,
        marginLeft: 15,
    },
    studioName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    studioTagline: {
        fontSize: 14,
        color: '#D4D4D4',
        marginTop: 2,
    },
    feedbackContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 15,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(40, 40, 60, 0.5)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
    },
    actionButtonActive: {
        backgroundColor: 'rgba(40, 40, 60, 0.8)',
    },
    actionText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 8,
    },
    actionTextActive: {
        color: '#FF5F6D',
    },
    actionTextActiveBlue: {
        color: '#5C80FF',
    },
    commentsContainer: {
        margin: 15,
        marginTop: 0,
    },
    commentsHeader: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    commentsCount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    addCommentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    commentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    commentInput: {
        flex: 1,
        height: 40,
        backgroundColor: 'rgba(40, 40, 60, 0.5)',
        borderRadius: 20,
        marginLeft: 10,
        color: '#FFFFFF',
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    sendButton: {
        padding: 10,
        marginLeft: 8,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    loadingContainer: {
        padding: 30,
        alignItems: 'center',
    },
    noCommentsContainer: {
        padding: 30,
        alignItems: 'center',
    },
    noCommentsText: {
        color: '#D4D4D4',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 15,
        width: '80%',
    },
    commentItem: {
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userBadge: {
        backgroundColor: '#FF5F6D',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    userBadgeText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    commentText: {
        fontSize: 14,
        color: '#EEEEEE',
        marginTop: 6,
        lineHeight: 20,
    },
    commentActions: {
        flexDirection: 'row',
        marginTop: 10,
    },
    commentAction: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    commentActionText: {
        fontSize: 12,
        color: '#AAAAAA',
        marginLeft: 6,
    },
    spacer: {
        height: 50,
    },
});

export default EpisodeDisplayScreen;