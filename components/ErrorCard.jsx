import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../assets/styles/home.styles";
import PropTypes from 'prop-types';

export const ErrorCard = ({ error, onRetry, title = "Connection Error" }) => {
  if (!error) return null;

  return (
    <View style={[styles.card, { backgroundColor: '#ffebee' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Ionicons name="warning" size={20} color="#d32f2f" />
        <Text style={[styles.sectionTitle, { marginLeft: 8, color: '#d32f2f' }]}>
          {title}
        </Text>
      </View>
      <Text style={{ color: '#d32f2f', marginBottom: 15 }}>
        {error}
      </Text>
      {onRetry && (
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: '#d32f2f' }]}
          onPress={onRetry}
        >
          <Ionicons name="refresh" size={16} color="#FFF" />
          <Text style={styles.addButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

ErrorCard.propTypes = {
  error: PropTypes.string,
  onRetry: PropTypes.func,
  title: PropTypes.string,
};
