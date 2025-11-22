import { StyleSheet } from 'react-native';
import QRColors from './colors';
import TextStyles from '../../../constants/textStyle';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: QRColors.background,
  },

  card: {
    backgroundColor: QRColors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: QRColors.primary,
  },

  headerTitle: {
    ...TextStyles.systemBold_24,
    color: QRColors.textWhite,
  },

  headerSubtitle: {
    ...TextStyles.systemLight_14,
    color: QRColors.textWhite,
    opacity: 0.9,
    marginTop: 4,
  },

  section: {
    marginBottom: 16,
  },

  sectionTitle: {
    ...TextStyles.systemBold_16,
    color: QRColors.textPrimary,
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  button: {
    backgroundColor: QRColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    ...TextStyles.systemBold_16,
    color: QRColors.textWhite,
  },

  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: QRColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  outlineButtonText: {
    ...TextStyles.systemBold_16,
    color: QRColors.primary,
  },

  divider: {
    height: 1,
    backgroundColor: QRColors.border,
    marginVertical: 16,
  },

  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default commonStyles;
