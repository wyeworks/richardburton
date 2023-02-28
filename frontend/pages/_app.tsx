import "styles/globals.css";
import type { AppProps } from "next/app";
import { FC } from "react";
import axios, { AxiosInstance } from "axios";
import { RecoilRoot } from "recoil";
import Notifications from "components/Notifications";
import ClearSelection from "listeners/ClearSelection";
import { Publication } from "modules/publications";
import { getSession, SessionProvider } from "next-auth/react";
import HTTP from "modules/http";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const FILES_URL = process.env.NEXT_PUBLIC_FILES_URL;

const http = HTTP.client({ baseURL: API_URL });

http.interceptors.request.use(async (config) => {
  const session = await getSession();

  if (session && session.idToken && config.headers) {
    config.headers.Authorization = `Bearer ${session.idToken}`;
  }

  return config;
});

function request<T = void>(
  cb: (http: AxiosInstance) => Promise<T> | T
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
            reject((error.response?.data as any).errors?.detail);
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

enum Key {
  ENTER = "Enter",
}

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <SessionProvider>
      <RecoilRoot initializeState={Publication.STORE.initialize}>
        <Notifications />
        <ClearSelection />
        <Component {...pageProps} />
      </RecoilRoot>
    </SessionProvider>
  );
};

export default App;
export { request, Key, http, FILES_URL };
