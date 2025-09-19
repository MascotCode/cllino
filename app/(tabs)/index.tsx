import { Link } from "expo-router";
import { View, Text, Pressable } from "react-native";

export default function TabHome() {
  return (
    <View className="flex-1 items-center justify-center bg-red-100">
      <Text className="text-2xl font-bold text-red-700">
        Clinoo
      </Text>
      <Link href="/(public)" asChild>
        <Pressable className="bg-black rounded-2xl px-5 py-3">
          <Text className="text-white text-center">Start booking</Text>
        </Pressable>
      </Link>
    </View>
  );
}