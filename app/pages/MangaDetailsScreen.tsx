import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  TextInput,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { formatDate } from "@/utils/utils";
import { StatusType } from "@/enums/StatusType";
import useMangaStore from "@/stores/mangaStore";
import { Card } from "react-native-paper";
import iMangaData from "@/_types/iManga";
import iChapterData from "@/_types/iChapter";
import MangaService from "@/class/services/MangaService";

export default function MangaDetails() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const [nota, setNota] = useState<string>("0");
  const [chapters, setChapters] = useState<iChapterData[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isFormNota, setIsFormNota] = useState<boolean>(false);
  const [manga, setManga] = useState<iMangaData>({} as iMangaData);
  const [selectedChapter, setSelectedChapter] = useState<iChapterData | null>(
    null
  );

  const mangaStore = useMangaStore();
  const mangaService = new MangaService(mangaStore);

  useEffect(() => {
    fetchManga();
  }, [route.params.title]);

  const fetchManga = async () => {
    const title = Array.isArray(route.params.title)
      ? route.params.title[0]
      : route.params.title;

    const data: iMangaData = await mangaStore.getInfoManga(title);
    setManga(data);

    if (data.chapters) {
      setChapters(
        [...data.chapters].sort((a: iChapterData, b: iChapterData) =>
          a.title.localeCompare(b.title)
        )
      );
    }
  };

  const verifyEndDate = (manga: any): string => {
    return manga.endDate ? formatDate(manga.endDate) : "Still on display.";
  };

  const askContinueReading = (chapter: any) => {
    setSelectedChapter(chapter);
    setShowDialog(true);
  };

  const renderButtonNoteDelete = (manga: iMangaData) => {
    if (manga.nota != null) {
      return (
        <TouchableOpacity
          onPress={() => {
            setIsFormNota(false);
            mangaService.avaliaManga(manga.id, null);
            setManga({} as iMangaData);
            Alert.alert("Nota removida com sucesso!")
            fetchManga();
          }}
          style={styles.buttonReset}
        >
          <Text style={styles.buttonText}>Remover nota</Text>
        </TouchableOpacity>
      );
    }
  };

  const mostraOpcaoDeAvaliar = () => {
    if (manga.isInUserLibrary) {
      return (
        <TouchableOpacity
          style={styles.accessButton}
          onPress={() => setIsFormNota(true)}
        >
          <Text style={styles.buttonText}>Avaliar</Text>
        </TouchableOpacity>
      )
    }
  };

  const verificaProgressoLeitura = (chapter: iChapterData) => {
    if (chapter.status === StatusType.FINISHED) {
      return "Leitura finalizada";
    } else {
      if (chapter.readingProgress === 0) {
        return "Leitura não iniciada";
      } else {
        return `Pág: ${chapter.readingProgress}`
      };
    }
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Image source={{ uri: manga.image }} style={styles.image} />
            <View>
              <Text style={styles.title}>{manga.title}</Text>
              {mostraOpcaoDeAvaliar()}
            </View>
          </View>

          <View style={styles.meta}>
            <Text style={styles.metaText}>
              <Text style={styles.bold}>Qtde. Capítulos:</Text> {manga.size}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.bold}>Gênero:</Text> {manga.gender}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.bold}>Status:</Text> {manga.status}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.bold}>Autor:</Text> {manga.author}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.bold}>Data de criação:</Text>{" "}
              {formatDate(manga.creationDate)}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.bold}>Finalizado em:</Text>{" "}
              {verifyEndDate(manga)}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.bold}>Descrição:</Text> {manga.description}
            </Text>
          </View>

          <Text style={styles.chapterHeader}>Capítulos</Text>

          {chapters.map((chapter) => (
            <View
              key={chapter.id}
              style={[
                styles.chapterCard,
                chapter.status === StatusType.FINISHED && {
                  backgroundColor: "#D1FAE5",
                },
              ]}
            >
              <TouchableOpacity
                onPress={() =>
                  chapter.readingProgress !== 0
                    ? askContinueReading(chapter)
                    : navigation.navigate("ChapterReading", {
                      id: chapter.id,
                      title: manga.title,
                      progress: 1,
                    })
                }
              >
                <Text
                  style={[
                    styles.chapterTitle,
                    chapter.status === StatusType.FINISHED && { color: "#000" },
                  ]}
                >
                  {chapter.title}
                </Text>
              </TouchableOpacity>
              <Text
                style={[
                  styles.metaText,
                  chapter.status === StatusType.FINISHED && { color: "#000" },
                ]}
              >
                Páginas: {chapter.numberPages}
              </Text>
              <Text
                style={[
                  styles.metaText,
                  chapter.status === StatusType.FINISHED && { color: "#000" },
                ]}
              >
                Progresso:{" "}
                {verificaProgressoLeitura(chapter)}
              </Text>
            </View>
          ))}
        </ScrollView>

        <Modal
          visible={showDialog}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDialog(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Continuar Leitura</Text>
              </View>

              {selectedChapter && (
                <View style={styles.modalContent}>
                  <Image
                    source={{ uri: manga.image }}
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
                          { width: `${parseInt(String(selectedChapter.readingProgress)) / parseInt(String(selectedChapter.numberPages)) * 100}%` }
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
                    setShowDialog(false);
                    if (selectedChapter) {
                      navigation.navigate("ChapterReading", {
                        id: selectedChapter.id,
                        progress: selectedChapter.readingProgress
                      });
                    }
                  }}
                >
                  <Text style={styles.continueButtonText}>Continuar leitura</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.restartButton}
                  onPress={() => {
                    setShowDialog(false);
                    if (selectedChapter) {
                      navigation.navigate("ChapterReading", {
                        id: selectedChapter.id,
                        progress: 1
                      });
                    }
                  }}
                >
                  <Text style={styles.restartButtonText}>Começar do início</Text>
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
              <Text style={styles.modalTitle}>Avaliação de Mangá</Text>
              <Text style={styles.mangaTitle}>
                Você está avaliando:{" "}
                <Text style={styles.mangaName}>{manga.title}</Text>
              </Text>

              <TextInput
                style={styles.inputNota}
                placeholder="Digite uma nota de 0 a 10"
                value={nota}
                onChangeText={(text) => {
                  const numeric = text.replace(/[^0-9]/g, "");
                  const parsed = parseInt(numeric, 10);
                  if (!isNaN(parsed) && parsed <= 10) {
                    setNota(numeric);
                  } else if (numeric === "") {
                    setNota("");
                  }
                }}
                keyboardType="numeric"
                maxLength={2}
              />

              <TouchableOpacity
                onPress={() => {
                  mangaService.avaliaManga(manga.id, nota);
                  setIsFormNota(false);
                  Alert.alert("Avaliação enviada!");
                  setManga({} as iMangaData)
                  fetchManga()
                }}
                style={styles.buttonAvaliar}
              >
                <Text style={styles.buttonText}>Avaliar</Text>
              </TouchableOpacity>

              {renderButtonNoteDelete(manga)}

              <TouchableOpacity
                onPress={() => setIsFormNota(false)}
                style={styles.buttonFechar}
              >
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
    backgroundColor: "#121212",
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
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "center",
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 12,
    marginRight: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    flexShrink: 1,
    color: "#FFFFFF",
  },
  meta: {
    marginBottom: 24,
  },
  metaText: {
    marginBottom: 6,
    fontSize: 16,
    color: "#CCCCCC",
  },
  bold: {
    fontWeight: "600",
    color: "#FFFFFF",
  },
  chapterHeader: {
    fontSize: 20,
    fontWeight: "600",
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF",
    marginBottom: 16,
    paddingBottom: 6,
    color: "#FFFFFF",
  },
  chapterCard: {
    padding: 16,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#333",
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    color: "#FFFFFF",
  },
  modalActions: {
    flexDirection: "row",
    gap: 16,
  },
  buttonConfirm: {
    backgroundColor: "#16A34A",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonCancel: {
    backgroundColor: "#4B5563",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 10,
  },
  accessButton: {
    marginTop: 15,
    width: "100%",
    backgroundColor: "#10b981",
    paddingVertical: 3,
    borderRadius: 8,
    alignItems: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#1a1a1d",
    padding: 20,
    borderRadius: 16,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: 'white',
    marginBottom: 12,
    textAlign: "center",
  },
  mangaTitle: {
    color: "#f1faee",
    fontSize: 16,
    marginBottom: 10,
  },
  mangaName: {
    fontWeight: "bold",
    color: "#a8dadc",
  },
  inputNota: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  buttonAvaliar: {
    backgroundColor: "#e63946",
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonFechar: {
    backgroundColor: "#457b9d",
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonReset: {
    backgroundColor: "#008555",
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
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
    alignItems: 'center'
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
