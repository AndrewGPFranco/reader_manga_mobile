import JobScreen from "@/app/pages/JobScreen";
import HomeScreen from "@/app/pages/HomeScreen";
import LoginScreen from "@/app/pages/LoginScreen";
import RegisterScreen from "./pages/RegisterScreen";
import ChapterReadingScreen from "./pages/ChapterReadingScreen";
import ProgressReadingScreen from "./pages/ProgressReadingScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MangaDetails from "./pages/MangaDetailsScreen";
import ProfileScreen from "@/app/pages/ProfileScreen";
import AllMangasList from "@/app/pages/AllMangasList";
import FavoriteManga from "@/app/pages/FavoriteManga";
import MangaLibraryScreen from "@/app/pages/MangaLibraryScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Job" options={{ headerShown: false }} component={JobScreen} />
      <Stack.Screen name="Home" options={{ headerShown: false }} component={HomeScreen} />
      <Stack.Screen name="Login" options={{ headerShown: false }} component={LoginScreen} />
      <Stack.Screen name="Profile" options={{ headerShown: false }} component={ProfileScreen} />
      <Stack.Screen name="Favorites" options={{ headerShown: false }} component={FavoriteManga} />
      <Stack.Screen name="MangaDetails" options={{ headerShown: false }} component={MangaDetails} />
      <Stack.Screen name="Library" options={{ headerShown: false }} component={MangaLibraryScreen} />
      <Stack.Screen name="AllMangasList" options={{ headerShown: false }} component={AllMangasList} />
      <Stack.Screen name="RegisterUser" options={{ headerShown: false }} component={RegisterScreen} />
      <Stack.Screen name="ChapterReading" options={{ headerShown: false }} component={ChapterReadingScreen} />
      <Stack.Screen name="ProgressReading" options={{ headerShown: false }} component={ProgressReadingScreen} />
    </Stack.Navigator>
  );
}