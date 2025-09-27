import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { useTransactions } from "../../hooks/useTransactions";
import { useEffect } from "react";
import { styles } from "../../assets/styles/home.styles";
import { COLORS } from "../../constants/colors";

export default function AnalyticsScreen() {
  const { user } = useUser();
  const { summary, loadData } = useTransactions(user.id);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const analyticsCards = [
    {
      title: "Monthly Overview",
      icon: "calendar",
      description: "Track your spending patterns over time",
      comingSoon: true,
    },
    {
      title: "Category Breakdown",
      icon: "pie-chart",
      description: "See where your money goes by category",
      comingSoon: true,
    },
    {
      title: "Spending Trends",
      icon: "trending-up",
      description: "Analyze your financial trends and patterns",
      comingSoon: true,
    },
    {
      title: "Budget Analysis",
      icon: "wallet",
      description: "Compare spending against your budgets",
      comingSoon: true,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>

        {/* QUICK STATS */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>
            <Ionicons name="stats-chart" size={20} color={COLORS.primary} /> Quick Stats
          </Text>
          
          <View style={styles.quickStatsContainer}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>₹{parseFloat(summary.balance).toFixed(2)}</Text>
              <Text style={styles.quickStatLabel}>Total Balance</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={[styles.quickStatValue, { color: COLORS.income }]}>
                +₹{parseFloat(summary.income).toFixed(2)}
              </Text>
              <Text style={styles.quickStatLabel}>Total Income</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={[styles.quickStatValue, { color: COLORS.expense }]}>
                -₹{Math.abs(parseFloat(summary.expenses)).toFixed(2)}
              </Text>
              <Text style={styles.quickStatLabel}>Total Expenses</Text>
            </View>
          </View>
        </View>

        {/* ANALYTICS FEATURES */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>
            <Ionicons name="analytics" size={20} color={COLORS.primary} /> Analytics Features
          </Text>

          {analyticsCards.map((card, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.analyticsCard,
                card.comingSoon && styles.analyticsCardDisabled
              ]}
              disabled={card.comingSoon}
            >
              <View style={styles.analyticsIconContainer}>
                <Ionicons 
                  name={card.icon} 
                  size={24} 
                  color={card.comingSoon ? COLORS.textLight : COLORS.primary} 
                />
              </View>
              <View style={styles.analyticsContent}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={[
                    styles.analyticsTitle,
                    card.comingSoon && { color: COLORS.textLight }
                  ]}>
                    {card.title}
                  </Text>
                  {card.comingSoon && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>Soon</Text>
                    </View>
                  )}
                </View>
                <Text style={[
                  styles.analyticsDescription,
                  card.comingSoon && { color: COLORS.textLight }
                ]}>
                  {card.description}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={card.comingSoon ? COLORS.textLight : COLORS.textLight} 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* COMING SOON BANNER */}
        <View style={[styles.card, { marginTop: 20, backgroundColor: COLORS.background }]}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18}}>
            <Ionicons name="sparkles" size={20} color={COLORS.primary} />
            <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>
              Advanced Analytics
            </Text>
          </View>
          <Text style={{ color: COLORS.textLight, lineHeight: 20  ,marginBottom: 40}}>
            We're building powerful analytics features including interactive charts, 
            spending predictions, and personalized financial insights.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
