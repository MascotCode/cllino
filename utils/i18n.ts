import { I18nManager } from 'react-native';

export const isRTL = I18nManager.isRTL;

export const getChevronIcon = () => {
  return isRTL ? 'chevron-back' : 'chevron-forward';
};
