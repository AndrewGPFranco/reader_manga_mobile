import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import UserService from "@/class/services/UserService";
import { useEffect, useState } from "react";
import { handleUriPath } from "@/utils/utils";

type NavigationProps = {
    navigate: (screen: string, params?: any) => void;
};

const Navbar = () => {
    const userService = new UserService();
    const [photo, setPhoto] = useState<string>("");
    const navigation = useNavigation<NavigationProps>();

    useEffect(() => {
        handleProfilePhoto();
    }, []);

    const handleProfilePhoto = async () => {
        const uriProfilePhoto = await userService.getProfilePhoto();
        setPhoto(handleUriPath(uriProfilePhoto));
    }

    return (
        <View style={styles.navbar}>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                <Image
                    source={{ uri: photo }}
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