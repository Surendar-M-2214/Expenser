import { View, Text, ActivityIndicator } from "react-native";
import { styles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";
import PropTypes from 'prop-types';

export const LoadingCard = ({ message = "Loading..." }) => {
  return (
    <View style={[styles.card, { alignItems: 'center', paddingVertical: 30 }]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={[styles.sectionTitle, { marginTop: 15, color: COLORS.textLight }]}>
        {message}
      </Text>
    </View>
  );
};

LoadingCard.propTypes = {
  message: PropTypes.string,
};
