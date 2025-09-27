// styles/home.styles.js
import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../../constants/colors";

// Responsive utilities
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375 || height < 667;
const isLargeScreen = width > 414;

// Calculate bottom navigation height dynamically
export const getBottomNavHeight = () => {
  let baseHeight = 60; // default
  if (isSmallScreen) baseHeight = 55;
  else if (isLargeScreen) baseHeight = 65;
  
  return baseHeight + 30; // Add extra padding for safe area
};

export const  styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 2, // Let individual screens handle their own bottom spacing
  },
  content: {
    padding: 20,
    paddingBottom: 20, // Normal bottom padding
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerLogo: {
    width: 75,
    height: 75,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    marginLeft: 4,
  },
  profileImageButton: {
    marginRight: 12,
  },
  profileImageContainer: {
    position: "relative",
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
  },
  profileImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  profileImageBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  defaultProfileIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  balanceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  balanceTitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
  },
  balanceStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceStatItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  balanceStatLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  balanceStatAmount: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 15,
  },
  transactionCard: {
   
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionContent: {
    flex: 1,
    flexDirection: "row",
    padding: 5,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionLeft: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 20,
    textAlign: "left",
  },
  transactionCategory: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  transactionRight: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  deleteButton: {
    padding: 15,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  transactionsContainer: {
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyStateText: {
    color: COLORS.textLight,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyStateButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    marginLeft: 6,
  },
  transactionsHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 5,
  },
  transactionsList: {
    flex: 1,
    marginHorizontal: 20,
  },
  transactionsListContent: {
    paddingBottom: 20, // Normal bottom padding
  },

  // Upload Screen Styles
  uploadOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  uploadContent: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  uploadDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },

  // Analytics Screen Styles
  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickStatItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
  },
  analyticsCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  analyticsCardDisabled: {
    opacity: 0.6,
  },
  analyticsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  analyticsContent: {
    flex: 1,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  analyticsDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },

  // Messenger-Style AI Screen
  messengerContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messengerHeader: {
    backgroundColor: COLORS.primary,
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  messengerChat: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messengerMessageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  aiMessageWrapper: {
    justifyContent: 'flex-start',
  },
  aiAvatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  userAvatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.textLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 4,
  },
  messengerBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessengerBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  aiMessengerBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messengerText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessengerText: {
    color: COLORS.white,
  },
  aiMessengerText: {
    color: COLORS.text,
  },
  messengerInputContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 50,
  },
  messengerInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 100,
    paddingVertical: 8,
  },
  messengerSendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messengerSendButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  animatedLoadingContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ChatGPT-Style AI Screen
  chatgptContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  chatgptChat: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatgptWelcome: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  chatgptWelcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  chatgptWelcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  chatgptSuggestions: {
    width: '100%',
    gap: 12,
  },
  chatgptSuggestionChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  chatgptSuggestionText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
  },
  chatgptMessageContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  chatgptUserMessage: {
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
  },
  chatgptAiMessage: {
    backgroundColor: 'transparent',
  },
  chatgptUserBubble: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    maxWidth: '80%',
    alignSelf: 'flex-end',
  },
  chatgptUserText: {
    fontSize: 18,
    color: '#ffffff',
    lineHeight: 24,
  },
  chatgptMessageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '100%',
  },
  chatgptAiIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  chatgptMessageText: {
    flex: 1,
    fontSize: 18,
    lineHeight: 26,
    color: COLORS.text,
  },
  chatgptHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 4,
    lineHeight: 24,
  },
  chatgptTyping: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatgptTypingText: {
    fontSize: 18,
    color: COLORS.textLight,
    marginRight: 4,
  },
  chatgptTypingDots: {
    flexDirection: 'row',
  },
  chatgptTypingDot: {
    fontSize: 18,
    color: COLORS.textLight,
    marginRight: 2,
  },
  chatgptInputContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    position: 'relative',
    minHeight: 80,
  },
  chatgptInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  chatgptInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 120,
    paddingVertical: 8,
  },
  chatgptSendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  chatgptSendButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userMessageBubble: {
    backgroundColor: COLORS.primary,
  },
  aiMessageBubble: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 22,
  },
  userMessageText: {
    color: COLORS.white,
  },
  aiMessageText: {
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
  aiMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
  },
  chatInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 100,
    paddingRight: 12,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  aiFeatureCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  aiFeatureCardDisabled: {
    opacity: 0.6,
  },
  aiFeatureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  aiFeatureContent: {
    flex: 1,
  },
  aiFeatureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  aiFeatureDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },

  // Coming Soon Badge
  comingSoonBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  comingSoonText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: "600",
  },

  // Upload Preview Styles
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 16,
  },
  transactionActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: COLORS.background,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: "500",
  },
  typeButtonTextActive: {
    color: COLORS.white,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },

  // Market Data Styles
  marketSection: {
    marginBottom: 16,
  },
  marketSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  marketItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  marketItemLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    flex: 1,
  },
  marketItemValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginRight: 8,
  },
  marketChangeText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Market Box Styles for Horizontal Scroll
  marketBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    marginTop: 8,
    marginBottom: 8,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  marketBoxTitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
    textAlign: 'center',
  },
  marketBoxValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  marketBoxUnit: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
    textAlign: 'center',
  },

  // Welcome Message Styles
  welcomeMessage: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  welcomeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeMessageText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    fontWeight: '500',
  },
  sampleQuestionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  sampleQuestionsTitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
    fontWeight: '500',
  },
  sampleQuestionChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sampleQuestionChipText: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 18,
  },

});
