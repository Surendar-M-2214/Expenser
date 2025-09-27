import { useUser } from "@clerk/clerk-expo";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dimensions } from "react-native";
import PropTypes from "prop-types";
import { COLORS } from "../../constants/colors";

// Icon components for better performance
const HomeIcon = ({ color, focused, size }) => (
  <Ionicons 
    name={focused ? "home" : "home-outline"} 
    size={size} 
    color={color} 
  />
);

HomeIcon.propTypes = {
  color: PropTypes.string.isRequired,
  focused: PropTypes.bool.isRequired,
  size: PropTypes.number.isRequired,
};

const TransactionsIcon = ({ color, focused, size }) => (
  <Ionicons 
    name={focused ? "list" : "list-outline"} 
    size={size} 
    color={color} 
  />
);

TransactionsIcon.propTypes = {
  color: PropTypes.string.isRequired,
  focused: PropTypes.bool.isRequired,
  size: PropTypes.number.isRequired,
};

const UploadIcon = ({ color, focused, size }) => (
  <Ionicons 
    name={focused ? "cloud-upload" : "cloud-upload-outline"} 
    size={size} 
    color={color} 
  />
);

UploadIcon.propTypes = {
  color: PropTypes.string.isRequired,
  focused: PropTypes.bool.isRequired,
  size: PropTypes.number.isRequired,
};

const AnalyticsIcon = ({ color, focused, size }) => (
  <Ionicons 
    name={focused ? "analytics" : "analytics-outline"} 
    size={size} 
    color={color} 
  />
);

AnalyticsIcon.propTypes = {
  color: PropTypes.string.isRequired,
  focused: PropTypes.bool.isRequired,
  size: PropTypes.number.isRequired,
};

const AIIcon = ({ color, focused, size }) => (
  <Ionicons 
    name={focused ? "sparkles" : "sparkles-outline"} 
    size={size} 
    color={color} 
  />
);

AIIcon.propTypes = {
  color: PropTypes.string.isRequired,
  focused: PropTypes.bool.isRequired,
  size: PropTypes.number.isRequired,
};

export default function Layout() {
  const { isSignedIn, isLoaded } = useUser();
  const insets = useSafeAreaInsets();


  if (!isLoaded) return null; // this is for a better ux

  if (!isSignedIn) return <Redirect href={"/sign-in"} />;

  return (
   <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 0,
          paddingBottom: 5,
          paddingTop: 5,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <HomeIcon color={color} focused={focused} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, focused }) => (
            <TransactionsIcon color={color} focused={focused} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ color, focused }) => (
            <UploadIcon color={color} focused={focused} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, focused }) => (
            <AnalyticsIcon color={color} focused={focused} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI",
          tabBarIcon: ({ color, focused }) => (
            <AIIcon color={color} focused={focused} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
