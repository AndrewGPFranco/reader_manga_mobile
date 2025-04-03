import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./HomeScreen";
import LoginScreen from "./LoginScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Home" options={{ headerShown: false }} component={HomeScreen} />
      <Stack.Screen name="Login" options={{ headerShown: false }} component={LoginScreen} />
    </Stack.Navigator>
  );
}