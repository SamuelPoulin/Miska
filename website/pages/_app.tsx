import type { AppProps } from "next/app";
import getConfig from "next/config";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { createClient, Provider } from "urql";

import { theme } from "../src/theme/Theme";

const { publicRuntimeConfig } = getConfig();

import "../src/styles/fonts.css";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

const client = createClient({
  url: `${publicRuntimeConfig.host}/graphql`,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <Provider value={client}>
          <Component {...pageProps} />
        </Provider>
      </ThemeProvider>
    </>
  );
}
export default MyApp;
