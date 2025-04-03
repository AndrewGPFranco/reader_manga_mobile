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
import axios from "axios";
import { Manga } from "./_types/Manga";
import Navbar from "@/components/home/Navbar";

const HomeScreen = () => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getMangas = async () => {
    try {
      const response = await axios.get(
        "http://192.168.15.17:8080/api/v1/manga/readAll/9",
        {
          headers: {
            Authorization:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJyZWFkZXItbWFuZ2EiLC" +
              "JpZCI6MSwicm9sZSI6IlVTRVIsQURNSU4iLCJzdWIiOiJhZG1pbkBnbWFpbC5jb20iLCJl" +
              "eHAiOjE3NDM3MjE4NTh9.JL_SIerI72S95rTF_61WyaUxdxtV5fWQ791MgVab4fA",
          },
        }
      );
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
  bottomSpacing: { height: 20 }
});

export default HomeScreen;
