import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/app/pages/HomeScreen";
import LoginScreen from "@/app/pages/LoginScreen";
import ProgressReadingScreen from "./pages/ProgressReadingScreen";
import ChapterReadingScreen from "./pages/ChapterReadingScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Home" options={{ headerShown: false }} component={HomeScreen} />
      <Stack.Screen name="Login" options={{ headerShown: false }} component={LoginScreen} />
      <Stack.Screen name="ProgressReading" options={{ headerShown: false }} component={ProgressReadingScreen} />
      <Stack.Screen name="ChapterReading" options={{ headerShown: false }} component={ChapterReadingScreen} />
    </Stack.Navigator>
  );
}