// styles/create.styles.js
import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  backButton: {
    padding: 5,
  },
  saveButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButton: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
  },
  card: {
    backgroundColor: COLORS.card,
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeSelector: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeIcon: {
    marginRight: 8,
  },
  typeButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "500",
  },
  typeButtonTextActive: {
    color: COLORS.white,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 16,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 15,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryButtonText: {
    color: COLORS.text,
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: COLORS.white,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // Receipt Upload Styles
  receiptContainer: {
    marginBottom: 20,
  },
  receiptPreviewContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  receiptPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  receiptActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  receiptActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  receiptActionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  receiptUploadButton: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptUploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 4,
  },
  receiptUploadSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
