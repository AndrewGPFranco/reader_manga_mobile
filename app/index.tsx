import JobScreen from "@/app/pages/JobScreen";
import HomeScreen from "@/app/pages/HomeScreen";
import LoginScreen from "@/app/pages/LoginScreen";
import RegisterScreen from "./pages/RegisterScreen";
import ChapterReadingScreen from "./pages/ChapterReadingScreen";
import ProgressReadingScreen from "./pages/ProgressReadingScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Job" options={{ headerShown: false }} component={JobScreen} />
      <Stack.Screen name="Home" options={{ headerShown: false }} component={HomeScreen} />
      <Stack.Screen name="Login" options={{ headerShown: false }} component={LoginScreen} />
      <Stack.Screen name="RegisterUser" options={{ headerShown: false }} component={RegisterScreen} />
      <Stack.Screen name="ChapterReading" options={{ headerShown: false }} component={ChapterReadingScreen} />
      <Stack.Screen name="ProgressReading" options={{ headerShown: false }} component={ProgressReadingScreen} />
    </Stack.Navigator>
  );
}