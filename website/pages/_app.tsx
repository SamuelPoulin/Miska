import type { AppProps } from "next/app";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { cacheExchange, createClient, dedupExchange, Provider } from "urql";
import { multipartFetchExchange } from '@urql/exchange-multipart-fetch';

import { theme } from "../src/theme/Theme";

import "../src/styles/fonts.css";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

const client = createClient({
  url: `/graphql`,
  exchanges: [dedupExchange, cacheExchange, multipartFetchExchange]
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
