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
import { Button, Card, Chip } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const HomeScreen = () => {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = [
    "Ação",
    "Aventura",
    "Romance",
    "Fantasia",
    "Sci-Fi",
    "Horror",
    "Comédia",
    "Drama",
  ];

  const getMangas = async () => {
    try {
      const response = await axios.get(
        "http://192.168.15.17:8080/api/v1/manga/readAll/9", {
          headers: {
            Authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJyZWFkZXItbWFuZ2EiLCJpZCI6MSwicm9sZSI6IlVTRVIsQURNSU4iLCJzdWIiOiJhZG1pbkBnbWFpbC5jb20iLCJleHAiOjE3NDM3MjE4NTh9.JL_SIerI72S95rTF_61WyaUxdxtV5fWQ791MgVab4fA"
          }
        });
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
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Descubra Novos Mangás</Text>
          <Button
            mode="contained"
            onPress={getMangas}
            icon={() => <Ionicons name="refresh" size={16} color="white" />}
          >
            Atualizar
          </Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias Populares</Text>
          <View style={styles.chipContainer}>
            {categories.map((category) => (
              <Chip key={category} style={styles.chip}>
                {category}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mangás Populares</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loader}
          />
        ) : error !== "" ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.mangaGrid}>
            {mangas.map((item, index) => (
              <TouchableOpacity key={index} style={styles.mangaCard}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.mangaImage}
                />
                <View style={styles.overlay}>
                  <Text style={styles.mangaTitle}>{item.title}</Text>
                  <Button mode="contained">Ler agora</Button>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#333" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { margin: 4 },
  loader: { marginVertical: 20 },
  errorText: { color: "red", textAlign: "center", marginVertical: 10 },
  mangaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  mangaCard: {
    width: 150,
    height: 220,
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    elevation: 3,
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
});

export default HomeScreen;