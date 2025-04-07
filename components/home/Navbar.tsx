import {View, Image, StyleSheet, TouchableOpacity} from "react-native";
import {useNavigation} from "@react-navigation/native";

type NavigationProps = {
    navigate: (screen: string, params?: any) => void;
};

const Navbar = () => {
    const navigation = useNavigation<NavigationProps>();

    return (
        <View style={styles.navbar}>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                <Image
                    source={{ uri: "https://github.com/andrewgpfranco.png" }}
                    style={styles.avatar}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    navbar: {
        display: "flex",
        padding: 25,
        justifyContent: "flex-end",
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