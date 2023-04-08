import "styles/globals.css";
import type { AppProps } from "next/app";
import { FC } from "react";
import axios, { AxiosInstance } from "axios";
import { RecoilRoot } from "recoil";
import Notifications from "components/Notifications";
import ClearSelection from "listeners/ClearSelection";
import { Publication } from "modules/publication";
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
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (error.response.status === 409) {
            reject("conflict");
          } else {
            if (error.response.data) {
              const detail = (error.response?.data as any).errors?.detail;
              if (detail) {
                reject(detail);
              } else {
                reject(error.response?.data);
              }
            } else {
              reject(error.message);
            }
          }
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          reject(error.message);
        } else {
          // Something happened in setting up the request that triggered an Error
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
  ARROW_RIGHT = "ArrowRight",
  ARROW_UP = "ArrowUp",
  ARROW_DOWN = "ArrowDown",
  BACKSPACE = "Backspace",
  COMMA = ",",
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
