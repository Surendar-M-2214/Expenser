import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SignOutButton } from "@/components/SignOutButton";
import { useTransactions } from "../../hooks/useTransactions";
import { useEffect, useState } from "react";
import PageLoader from "../../components/PageLoader";
import { styles } from "../../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import { BalanceCard } from "../../components/BalanceCard";
import { TransactionItem } from "../../components/TransactionItem";
import NoTransactionsFound from "../../components/NoTransactionsFound";
import ProfileModal from "../(modals)/profile";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [updatedProfileImage, setUpdatedProfileImage] = useState(null);

  const { transactions, summary, isLoading, loadData, deleteTransaction, error } = useTransactions(
    user?.id
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = (id) => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTransaction(id) },
    ]);
  };

  const handleProfileUpdate = () => {
    setProfileUpdated(prev => !prev);
    // Force refresh of profile image
    setUpdatedProfileImage(user?.imageUrl);
  };

  const displaySummary = summary || { balance: 0, income: 0, expenses: 0 };

  if (isLoading && !refreshing) return <PageLoader />;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          {/* LEFT */}
          <View style={styles.headerLeft}>
           
            <TouchableOpacity 
              onPress={() => setProfileModalVisible(true)}
              style={styles.profileImageButton}
              activeOpacity={0.7}
            >
              {(updatedProfileImage || user?.imageUrl) ? (
                <View style={styles.profileImageContainer}>
                  <Image 
                    key={`profile-${profileUpdated}-${updatedProfileImage || user.imageUrl}`}
                    source={{ uri: updatedProfileImage || user.imageUrl }} 
                    style={styles.profileImage} 
                  />
                  <View style={styles.profileImageBorder} />
                </View>
              ) : (
                <View style={styles.defaultProfileIcon}>
                  <Ionicons name="person-circle" size={32} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.usernameText}>
                {user?.username || user?.emailAddresses[0]?.emailAddress.split("@")[0]}
              </Text>
            </View>
          </View>
          {/* RIGHT */}
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/(modals)/create")}>
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <SignOutButton />
          </View>
        </View>

        <BalanceCard summary={displaySummary} error={error} />

        <View style={styles.transactionsHeaderContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>
      </View>

      {/* FlatList is a performant way to render long lists in React Native. */}
      {/* it renders items lazily — only those on the screen. */}
      <FlatList
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data={transactions}
        renderItem={({ item }) => <TransactionItem item={item} onDelete={handleDelete} />}
        ListEmptyComponent={<NoTransactionsFound />}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {/* Profile Modal */}
      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        onProfileUpdated={handleProfileUpdate}
      />
    </View>
  );
}
