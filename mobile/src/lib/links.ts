import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';
import { isAllowedWebUrl } from '@/config';

export const openTrustedWebPage = async (url: string) => {
  if (!isAllowedWebUrl(url)) throw new Error('Blocked an untrusted web address.');
  await WebBrowser.openBrowserAsync(url, {
    controlsColor: '#102A1D',
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    showTitle: true,
  });
};

export const openPhone = async (phone: string) => {
  if (!/^\+?[0-9]{7,15}$/.test(phone)) throw new Error('Invalid phone number.');
  await Linking.openURL(`tel:${phone}`);
};

export const openEmail = async (email: string) => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email address.');
  await Linking.openURL(`mailto:${email}`);
};
