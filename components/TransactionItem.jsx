import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";
import { formatDate } from "../lib/utils";

// Map categories to their respective icons and types
const CATEGORY_ICONS = {
  "Food & Drinks": { icon: "fast-food", type: "expense" },
  Shopping: { icon: "cart", type: "expense" },
  Transportation: { icon: "car", type: "expense" },
  Entertainment: { icon: "film", type: "expense" },
  Bills: { icon: "receipt", type: "expense" },
  UPI: { icon: "phone-portrait", type: "expense" },
  Banking: { icon: "card", type: "expense" },
  Investment: { icon: "trending-up", type: "expense" },
  Healthcare: { icon: "medical", type: "expense" },
  Education: { icon: "school", type: "expense" },
  Travel: { icon: "airplane", type: "expense" },
  Subscription: { icon: "refresh", type: "expense" },
  Income: { icon: "cash", type: "income" },
  Other: { icon: "ellipsis-horizontal", type: "expense" },
};

export const TransactionItem = ({ item, onDelete, onPress }) => {
  // Backend uses 'type' field: 'credit' for income, 'debit' for expense
  const isIncome = item.type === 'credit';
  const categoryInfo = CATEGORY_ICONS[item.category] || { icon: "pricetag-outline", type: "expense" };
  const iconName = categoryInfo.icon;
  
  // Use transaction type to determine color
  const iconColor = isIncome ? COLORS.income : COLORS.expense;

  return (
    <View style={styles.transactionCard} key={item.id}>
      <TouchableOpacity style={styles.transactionContent} onPress={() => onPress && onPress(item)}>
        <View style={styles.categoryIconContainer}>
          <Ionicons name={iconName} size={22} color={iconColor} />
        </View>
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionTitle} numberOfLines={2} ellipsizeMode="tail">
            {item.description || item.title || 'Transaction'}
          </Text>
          <Text style={styles.transactionCategory}>{item.category}</Text>
          {item.reference && (
            <Text style={styles.transactionReference}>Ref: {item.reference}</Text>
          )}
        </View>
        <View style={styles.transactionRight}>
          <Text
            style={[styles.transactionAmount, { color: isIncome ? COLORS.income : COLORS.expense }]}
          >
            {isIncome ? "+" : "-"}₹{Math.abs(parseFloat(item.amount)).toFixed(2)}
          </Text>
          <Text style={styles.transactionDate}>{formatDate(item.transaction_date || item.created_at)}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id)}>
        <Ionicons name="trash-outline" size={20} color={COLORS.expense} />
      </TouchableOpacity>
    </View>
  );
};
