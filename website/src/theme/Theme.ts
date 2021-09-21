import { DefaultTheme } from 'styled-components';

export interface Theme extends DefaultTheme {
  headerHeight: string;
  footerHeight: string;

  colors: {
    primary: string;
    onPrimary: string;
    secondary: string;
    onSecondary: string;
    secondaryLight: string;
    onSecondaryLight: string;
    hoverSecondaryLight: string;
    accent: string;
    onAccent: string;
    hoverAccent: string;
    error: string;
    success: string;
    goodRating: string;
    badRating: string;
  };
}

export const theme: Theme = {
  headerHeight: '100px',
  footerHeight: '90px',

  colors: {
    primary: 'white',
    onPrimary: '#2B2B2B',
    secondary: '#2B2B2B',
    onSecondary: 'white',
    secondaryLight: '#F6F6F6',
    onSecondaryLight: '#2B2B2B',
    hoverSecondaryLight: '#F0F0F0',
    accent: '#EF233C',
    onAccent: 'white',
    hoverAccent: '#E4112A',
    error: 'red',
    success: '#70E000',
    goodRating: '#BDED33',
    badRating: '#A3A3A3',
  },
};
