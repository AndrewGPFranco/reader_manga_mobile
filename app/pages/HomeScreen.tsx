import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Button, Card } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "@/components/home/Navbar";
import { api } from "@/app/network/axiosInstance";
import iMangaData from "@/app/_types/iManga";

const HomeScreen = () => {
  const [mangas, setMangas] = useState<iMangaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getMangas = async () => {
    try {
      const response = await api.get("/manga/readAll/9");
      setMangas(response.data);
    } catch (err) {
      console.log(err);
      setError("Erro ao carregar os mangás");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMangas();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Navbar />
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Descubra Novos Mangás</Text>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={getMangas}
              icon={() => <Ionicons name="refresh" size={16} color="white" />}
            >
              Atualizar
            </Button>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias Populares</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mangás Populares</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#BB86FC"
            style={styles.loader}
          />
        ) : error !== "" ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.mangaGrid}>
            {mangas.map((item, index) => (
              <TouchableOpacity key={index} style={styles.mangaCard}>
                <Image source={{ uri: item.image }} style={styles.mangaImage} />
                <View style={styles.overlay}>
                  <Text style={styles.mangaTitle}>{item.title}</Text>
                  <Button mode="contained">Ler agora</Button>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  card: {
    backgroundColor: "#121212",
    padding: 16,
    borderRadius: 8,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  header: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#BB86FC" },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  chip: { backgroundColor: "#333", margin: 4 },
  loader: { marginVertical: 20 },
  errorText: { color: "#CF6679", textAlign: "center", marginVertical: 10 },
  mangaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  mangaCard: {
    width: 150,
    height: 220,
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    elevation: 3,
    backgroundColor: "#1E1E1E",
  },
  mangaImage: { width: "100%", height: "100%", resizeMode: "cover" },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 8,
  },
  mangaTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bottomSpacing: { height: 20 },
});

export default HomeScreen;
