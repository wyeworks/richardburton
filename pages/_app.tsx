import "styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { FC } from "react";
import axios from "axios";
import axiosCaseConverter from "axios-case-converter";
import { RecoilRoot } from "recoil";
import Errors from "components/Errors";

const queryClient = new QueryClient();
const API = axiosCaseConverter(
  axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  })
);

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <Errors />
        <Component {...pageProps} />
      </RecoilRoot>
    </QueryClientProvider>
  );
};

export { API };
export default App;
