import "styles/globals.css";
import type { AppProps } from "next/app";
import { FC } from "react";
import axios from "axios";
import axiosCaseConverter from "axios-case-converter";
import { RecoilRoot } from "recoil";
import Errors from "components/Errors";
import ClearSelection from "listeners/ClearSelection";

const API = axiosCaseConverter(
  axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  })
);

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <RecoilRoot>
      <Errors />
      <ClearSelection />
      <Component {...pageProps} />
    </RecoilRoot>
  );
};

export { API };
export default App;
