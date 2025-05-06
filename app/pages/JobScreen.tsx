import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    Alert,
    Modal,
    FlatList,
    ViewStyle
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/network/axiosInstance';
import useMangaStore from '@/stores/mangaStore';

interface SimpleProgressBarProps {
    progress: number;
    width?: number | string;
    height?: number;
    color?: string;
    backgroundColor?: string;
}

const SimpleProgressBar: React.FC<SimpleProgressBarProps> = ({
    progress,
    width = '100%',
    height = 10,
    color = '#50fa7b',
    backgroundColor = '#282a36'
}) => {
    return (
        <View style={{
            height,
            width: width,
            backgroundColor,
            borderRadius: 5,
            overflow: 'hidden'
        } as ViewStyle}>
            <View
                style={{
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: color,
                    borderRadius: 5
                } as ViewStyle}
            />
        </View>
    );
};

interface IJobType {
    nomeJob: string;
    tipoDoJob: string;
}

interface SelectedFileType {
    uri: string;
    name: string;
    type: string;
}

const JobScreen = () => {
    const [jobs, setJobs] = useState<IJobType[]>([]);
    const [selectedJob, setSelectedJob] = useState<string>('');
    const [tipoJob, setTipoJob] = useState<string>('');
    const [parametros, setParametros] = useState<string>('');
    const [titleChapter, setTitleChapter] = useState<string>('');
    const [titleManga, setTitleManga] = useState<string>('');
    const [mangasNomes, setMangasNomes] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<SelectedFileType | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [isExibirProgresso, setIsExibirProgresso] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const eventSourceRef = useRef<NodeJS.Timeout | null>(null);

    const mangaStore = useMangaStore();

    useEffect(() => {
        getJobsDisponiveis();
        getNomeDosMangasDisponiveis();
        return () => {
            fechaEventSource();
        };
    }, []);

    const getJobsDisponiveis = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await api.get('/job/get-jobs', {
                headers: {
                    Authorization: `${token}`
                }
            });
            setJobs(response.data);
        } catch (error: any) {
            console.error('Erro ao buscar jobs:', error);
            Alert.alert('Erro', 'Não foi possível carregar os jobs disponíveis');
        }
    };

    const getNomeDosMangasDisponiveis = async () => {
        try {
            const response = await mangaStore.getApenasNomeDosMangas();
            setMangasNomes(response);
        } catch (error: any) {
            console.error('Erro ao buscar mangás:', error);
            Alert.alert('Erro', 'Não foi possível carregar a lista de mangás');
        }
    };

    const selectJob = (job: string, tipoDoJob: string) => {
        setSelectedJob(job);
        setTipoJob(tipoDoJob);
    };

    const selectManga = (manga: string) => {
        setTitleManga(manga);
        setModalVisible(false);
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/zip'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setSelectedFile({
                    uri: file.uri,
                    name: file.name || 'chapter.pdf',
                    type: file.mimeType || 'application/octet-stream',
                });
            }
        } catch (err) {
            console.error('Erro ao selecionar arquivo:', err);
            Alert.alert('Erro', 'Não foi possível selecionar o arquivo');
        }
    };

    const validaInput = () => {
        return parametros.length > 0;
    };

    const validaUpload = () => {
        return selectedFile && titleChapter && titleManga;
    };

    const executaProgressoJob = () => {
        let progresso = 0;

        const interval = setInterval(() => {
            progresso += 10;
            if (progresso > 100) {
                progresso = 100;
                clearInterval(interval);
                setProgress(100);
            } else {
                setProgress(progresso);
            }
        }, 500);

        eventSourceRef.current = interval;
    };

    const fechaEventSource = () => {
        if (eventSourceRef.current) {
            clearInterval(eventSourceRef.current);
            eventSourceRef.current = null;
            setProgress(0);
        }
    };

    const limpaDados = () => {
        setSelectedJob('');
        setParametros('');
        setTitleChapter('');
        setTitleManga('');
        setSelectedFile(null);
    };

    const executeJob = async () => {
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            const isTipoParametros = tipoJob === 'Parâmetros';
            const job = selectedJob.toUpperCase();

            let validation = isTipoParametros ? validaInput() : validaUpload();

            if (!validation) {
                Alert.alert('Erro', isTipoParametros
                    ? 'Digite os parâmetros para executar o Job.'
                    : 'Preencha todos os campos e selecione um arquivo.');
                setIsLoading(false);
                return;
            }

            setIsExibirProgresso(true);
            let result;

            if (isTipoParametros) {
                result = await api.post(`/job/${job}/${parametros}`, null, {
                    headers: {
                        Authorization: `${token}`
                    }
                });
            } else {
                executaProgressoJob();

                const formData = new FormData();
                if (selectedFile) {
                    formData.append('file', {
                        uri: selectedFile.uri,
                        name: selectedFile.name,
                        type: selectedFile.type,
                    } as any);
                }

                if (titleChapter) formData.append('titleChapter', titleChapter);
                if (titleManga) formData.append('titleManga', titleManga);

                result = await api.post('/job/upload-chapter', formData, {
                    headers: {
                        Authorization: `${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                });
            }

            if (result.status === 200 && result.data !== '') {
                setProgress(100);
                Alert.alert('Sucesso', 'Job executado com sucesso!');
                fechaEventSource();
                limpaDados();
            } else {
                Alert.alert('Aviso', 'Houve um erro ao executar o Job.');
            }
        } catch (error: any) {
            console.error('Erro ao executar job:', error);
            Alert.alert('Erro', error.response?.data || 'Erro ao executar o Job');
        } finally {
            setIsLoading(false);
            setProgress(0);
            setIsExibirProgresso(false);
        }
    };

    const renderJobItem = (job: IJobType) => (
        <TouchableOpacity
            style={styles.jobItem}
            key={job.nomeJob}
            onPress={() => selectJob(job.nomeJob, job.tipoDoJob)}
        >
            <Text style={styles.jobText}>{job.nomeJob}</Text>
        </TouchableOpacity>
    );

    const renderMangaItem = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={styles.mangaItem}
            onPress={() => selectManga(item)}
        >
            <Text style={styles.mangaText}>{item}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Jobs</Text>

                <View style={styles.jobContainer}>
                    <View style={styles.jobList}>
                        <Text style={styles.sectionTitle}>Jobs Disponíveis</Text>
                        <ScrollView style={styles.listContainer}>
                            {jobs.map(renderJobItem)}
                        </ScrollView>
                    </View>

                    {selectedJob ? (
                        <View style={styles.jobForm}>
                            <Text style={styles.sectionTitle}>
                                Job selecionado: {selectedJob}
                            </Text>

                            {tipoJob === 'Parâmetros' && (
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Parâmetros</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Digite os parâmetros"
                                        placeholderTextColor="#6272a4"
                                        value={parametros}
                                        onChangeText={setParametros}
                                    />
                                </View>
                            )}

                            {tipoJob === 'Uploads' && (
                                <>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Número do Capítulo</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Digite o número do capítulo"
                                            placeholderTextColor="#6272a4"
                                            value={titleChapter}
                                            onChangeText={setTitleChapter}
                                            keyboardType="numeric"
                                        />
                                    </View>

                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Título do Mangá</Text>
                                        <TouchableOpacity
                                            style={styles.pickerButton}
                                            onPress={() => setModalVisible(true)}
                                        >
                                            <Text style={styles.pickerButtonText}>
                                                {titleManga || "Escolha o nome do mangá"}
                                            </Text>
                                            <Feather name="chevron-down" size={20} color="#bd93f9" />
                                        </TouchableOpacity>
                                    </View>

                                    <Modal
                                        animationType="slide"
                                        transparent={true}
                                        visible={modalVisible}
                                        onRequestClose={() => setModalVisible(false)}
                                    >
                                        <View style={styles.modalOverlay}>
                                            <View style={styles.modalContent}>
                                                <Text style={styles.modalTitle}>Selecione o Mangá</Text>
                                                <FlatList
                                                    data={mangasNomes}
                                                    renderItem={renderMangaItem}
                                                    keyExtractor={(item) => item}
                                                    style={styles.mangaList}
                                                />
                                                <TouchableOpacity
                                                    style={styles.closeButton}
                                                    onPress={() => setModalVisible(false)}
                                                >
                                                    <Text style={styles.closeButtonText}>Cancelar</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </Modal>

                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>PDF do capítulo</Text>
                                        <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
                                            <Feather name="upload" size={24} color="#000000" />
                                            <Text style={styles.uploadButtonText}>
                                                {selectedFile ? 'Arquivo selecionado' : 'Selecionar arquivo'}
                                            </Text>
                                        </TouchableOpacity>
                                        {selectedFile && (
                                            <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                                                {selectedFile.name}
                                            </Text>
                                        )}
                                    </View>
                                </>
                            )}

                            {isExibirProgresso && (
                                <View style={styles.progressContainer}>
                                    <Text style={styles.progressTitle}>Progresso do Job:</Text>
                                    <SimpleProgressBar progress={progress} />
                                    <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.executeButton, isLoading && styles.disabledButton]}
                                onPress={executeJob}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#f8f8f2" size="small" />
                                ) : (
                                    <Text style={styles.executeButtonText}>Executar Job</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.noSelection}>
                            <Text style={styles.noSelectionText}>
                                Selecione um job da lista para continuar
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    card: {
        flex: 1,
        margin: 15,
        padding: 20,
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#f8f8f2',
    },
    jobContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    jobList: {
        flex: 1,
        maxHeight: 200,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#bd93f9',
    },
    listContainer: {
        borderWidth: 1,
        borderColor: '#6272a4',
        borderRadius: 8,
        padding: 5,
    },
    jobItem: {
        padding: 15,
        backgroundColor: '#313442',
        borderBottomWidth: 1,
        borderBottomColor: '#44475a',
        borderRadius: 5,
        marginBottom: 5,
    },
    jobText: {
        fontSize: 16,
        color: '#f8f8f2',
    },
    jobForm: {
        flex: 2,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#6272a4',
    },
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#8be9fd',
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#6272a4',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#313442',
        color: '#f8f8f2',
    },
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#6272a4',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#313442',
    },
    pickerButtonText: {
        fontSize: 16,
        color: '#f8f8f2',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        width: '80%',
        maxHeight: '70%',
        backgroundColor: '#282a36',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#6272a4',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#bd93f9',
    },
    mangaList: {
        maxHeight: 300,
    },
    mangaItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#44475a',
    },
    mangaText: {
        fontSize: 16,
        color: '#f8f8f2',
    },
    closeButton: {
        marginTop: 15,
        padding: 12,
        backgroundColor: '#ff5555',
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#f8f8f2',
        fontSize: 16,
        fontWeight: '600',
    },
    uploadButton: {
        backgroundColor: '#8be9fd',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 8,
    },
    uploadButtonText: {
        color: '#282a36',
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    fileName: {
        marginTop: 5,
        fontSize: 14,
        color: '#bd93f9',
    },
    progressContainer: {
        marginVertical: 20,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 10,
        color: '#f8f8f2',
    },
    progressText: {
        fontSize: 14,
        color: '#50fa7b',
        textAlign: 'right',
        marginTop: 5,
    },
    executeButton: {
        backgroundColor: '#50fa7b',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    executeButtonText: {
        color: '#282a36',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: '#28614d',
    },
    noSelection: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#6272a4',
    },
    noSelectionText: {
        fontSize: 16,
        color: '#bd93f9',
        textAlign: 'center',
    }
});

export default JobScreen;