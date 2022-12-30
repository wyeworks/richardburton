import "styles/globals.css";
import type { AppProps } from "next/app";
import { FC } from "react";
import axios, { AxiosInstance } from "axios";
import axiosCaseConverter from "axios-case-converter";
import { RecoilRoot } from "recoil";
import Errors from "components/Errors";
import ClearSelection from "listeners/ClearSelection";

const http = axiosCaseConverter(
  axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  })
);

function request<T = void>(
  cb: (http: AxiosInstance) => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await cb(http);
      resolve(result);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 409) {
            reject("conflict");
          } else {
            reject(error.response?.data);
          }
        } else {
          reject(error.message);
        }
      } else {
        reject(error);
      }
    }
  });
}

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <RecoilRoot>
      <Errors />
      <ClearSelection />
      <Component {...pageProps} />
    </RecoilRoot>
  );
};

export default App;
export { request };
