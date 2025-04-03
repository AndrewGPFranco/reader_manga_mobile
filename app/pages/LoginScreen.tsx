import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { validationFieldsLogin } from "@/app/utils/validation";
import useAuthStore from "@/app/stores/authStore";

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  RegisterUser: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const formScale = new Animated.Value(1);

  const authStore = useAuthStore();

  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "Leitor de mangás - Login";
    }
  }, []);

  useEffect(() => {
    const hoverIn = () => {
      Animated.spring(formScale, {
        toValue: 1.02,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    const hoverOut = () => {
      Animated.spring(formScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    const interval = setInterval(() => {
      hoverIn();
      setTimeout(hoverOut, 2000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const limparCampos = () => {
    setEmail("");
    setPassword("");
  };

  const efetuarLogin = async () => {
    setLoading(true);

    const validation = validationFieldsLogin({ email, password });
    if (validation !== true) {
      showMessage(validation);
      setLoading(false);
      return;
    }

    try {
      await authStore.efetuarLogin(email, password);
      limparCampos();
      navigation.navigate("Home");
    } catch (error: any) {
      showMessage(
        error.message.includes("Cannot read properties")
          ? "Não há conexão com o servidor no momento!"
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message: string | boolean) => {
    alert(String(message));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <Animated.View
        style={[styles.form, { transform: [{ scale: formScale }] }]}
      >
        <Text style={styles.heading}>Login</Text>

        <View style={styles.field}>
          <Svg
            width={16}
            height={16}
            viewBox="0 0 16 16"
            style={styles.inputIcon}
          >
            <Path
              fill="#fff"
              d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"
            />
          </Svg>
          <TextInput
            style={styles.inputField}
            placeholder="Username"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Svg
            width={16}
            height={16}
            viewBox="0 0 16 16"
            style={styles.inputIcon}
          >
            <Path
              fill="#fff"
              d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"
            />
          </Svg>
          <TextInput
            style={styles.inputField}
            placeholder="Password"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.button1}
            onPress={efetuarLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Carregando..." : "Login"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button2}
            onPress={() => navigation.navigate("RegisterUser")}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

// Estilos permanecem iguais
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 20,
  },
  form: {
    width: Dimensions.get("window").width > 480 ? 400 : "90%",
    backgroundColor: "#1a1a1a",
    borderRadius: 25,
    padding: 40,
    gap: 20,
    borderWidth: 1,
    borderColor: "#444",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 10,
  },
  heading: {
    textAlign: "center",
    marginBottom: 30,
    color: "#00bfff",
    fontSize: 28,
    fontWeight: "700",
    textTransform: "uppercase",
    borderBottomWidth: 2,
    borderBottomColor: "#00bfff",
    paddingBottom: 10,
    alignSelf: "center",
    width: 100,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(105, 105, 105, 0.5)",
  },
  inputIcon: {
    height: 20,
    width: 20,
    opacity: 0.7,
  },
  inputField: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    padding: 8,
  },
  btnContainer: {
    flexDirection: Dimensions.get("window").width > 480 ? "row" : "column",
    justifyContent: "center",
    gap: 15,
    marginTop: 20,
  },
  button1: {
    backgroundColor: "#00bfff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    flex: Dimensions.get("window").width > 480 ? 1 : 0,
    justifyContent: "center",
    alignItems: "center",
  },
  button2: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    flex: Dimensions.get("window").width > 480 ? 1 : 0,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LoginScreen;
