import { View, Image, StyleSheet } from "react-native";

const Navbar = () => {
  return (
    <View style={styles.navbar}>
      <Image
        source={require("@/assets/images/logo.webp")}
        style={styles.logo}
      />
      <Image
        source={{ uri: "https://github.com/andrewgpfranco.png" }}
        style={styles.avatar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    display: "flex",
    padding: 25,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center"
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
});

export default Navbar;