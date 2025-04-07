import {Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useEffect, useState} from "react";
import useAuthStore from "@/app/stores/authStore";
import {useNavigation} from "@react-navigation/native";
import {UserSession} from "@/app/class/UserSession";

type NavigationProps = {
    navigate: (screen: string, params?: any) => void;
};

const ProfileScreen = () => {
    const [user, setUser] = useState<UserSession>();

    const authStore = useAuthStore();
    const navigation = useNavigation<NavigationProps>();

    useEffect(() => {
        getUserInfo().then(() => console.log("getUserInfo()"));
    }, []);

    const getUserInfo = async () => {
        try {
            const user = await authStore.getUser();

            if (user != null)
                setUser(user);
            else
                Alert.alert("Ocorreu um problema ao buscar as informações do usuário.")
        } catch (error) {
            console.log(error);
            Alert.alert(String(error));
        }
    }

    const efetuarLogout = async () => {
        await authStore.efetuarLogout()
        navigation.navigate("Login");
    }

    return (
        <View style={styles.fullScreenContainer}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.background}>
                    <View style={styles.mangaHeader}>
                        <View style={styles.decorativeLine}/>
                        <Text style={styles.headerText}>PERFIL</Text>
                        <View style={styles.decorativeLine}/>
                    </View>

                    <View style={styles.profileCard}>
                        <View style={styles.profileImageContainer}>
                            <Image
                                source={{uri: "https://github.com/andrewgpfranco.png"}}
                                style={styles.profileImage}
                            />
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>ONLINE</Text>
                            </View>
                        </View>

                        <View style={styles.nameContainer}>
                            <Text style={styles.profileName}>{user?.firstName || "Otaku-san"}</Text>
                            <Text style={styles.usernameBadge}>@{user?.username || "username"}</Text>
                        </View>

                        <View style={styles.infoContainer}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>EMAIL</Text>
                                <Text style={styles.infoValue}>{user?.email || "email@exemplo.com"}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>NASCIMENTO</Text>
                                <Text style={styles.infoValue}>
                                    {user?.dateBirth
                                        ? new Intl.DateTimeFormat('pt-BR').format(new Date(user.dateBirth))
                                        : 'DD/MM/YYYY'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{user?.mangas ?? 0}</Text>
                                <Text style={styles.statLabel}>Mangás</Text>
                            </View>
                            <View style={styles.statDivider}/>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{user?.inProgressReadings ?? 0}</Text>
                                <Text style={styles.statLabel}>Em andamento</Text>
                            </View>
                            <View style={styles.statDivider}/>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{user?.completeReadings ?? 0}</Text>
                                <Text style={styles.statLabel}>Leituras finalizadas</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.logoutButton} onPress={efetuarLogout}>
                            <Text style={styles.logoutButtonText}>LOGOUT</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.mangaFooter}>
                        <View style={styles.decorativeLine}/>
                        <View style={styles.decorativeLine}/>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#121212',
    },
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#121212',
    },
    scrollContent: {
        flexGrow: 1,
    },
    background: {
        display: "flex",
        justifyContent: "center",
        flex: 1,
        paddingVertical: 30,
        paddingHorizontal: 20,
        minHeight: 800,
        backgroundColor: 'black',
        borderTopWidth: 3,
        borderTopColor: '#1a1a2e',
    },
    mangaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        paddingVertical: 5,
    },
    mangaFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        paddingVertical: 5,
    },
    decorativeLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#ff4d6d',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff4d6d',
        marginHorizontal: 10,
    },
    profileCard: {
        backgroundColor: 'rgba(30, 30, 46, 0.8)',
        borderRadius: 15,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2c2c44',
        shadowColor: '#ff4d6d',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    profileImageContainer: {
        alignItems: 'center',
        position: 'relative',
        marginBottom: 25,
    },
    profileImage: {
        width: 130,
        height: 130,
        borderRadius: 65,
        borderWidth: 3,
        borderColor: '#ff4d6d',
    },
    statusBadge: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#50fa7b',
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2c2c44',
    },
    statusText: {
        color: '#1a1a2e',
        fontSize: 12,
        fontWeight: 'bold',
    },
    nameContainer: {
        alignItems: 'center',
        marginBottom: 25,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        textShadowColor: '#ff4d6d',
        textShadowOffset: {width: 0, height: 2},
        textShadowRadius: 3,
        marginBottom: 5,
    },
    usernameBadge: {
        fontSize: 16,
        color: '#8e8ea0',
    },
    infoContainer: {
        marginBottom: 25,
        backgroundColor: 'rgba(22, 22, 35, 0.6)',
        borderRadius: 10,
        padding: 15,
        borderLeftWidth: 3,
        borderLeftColor: '#ff4d6d',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center',
    },
    infoLabel: {
        width: 100,
        color: '#ff4d6d',
        fontSize: 12,
        fontWeight: 'bold',
    },
    infoValue: {
        flex: 1,
        color: '#e0e0e0',
        fontSize: 14,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(22, 22, 35, 0.6)',
        borderRadius: 10,
        padding: 15,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    statLabel: {
        fontSize: 12,
        color: '#8e8ea0',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#2c2c44',
    },
    buttonContainer: {
        marginTop: 30,
    },
    logoutButton: {
        backgroundColor: '#ff4d6d',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default ProfileScreen;