import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import axiosCaseConverter from "axios-case-converter";

type HttpClientOptions = AxiosRequestConfig;
type HttpClient = AxiosInstance;

interface HttpModule {
  client(options: HttpClientOptions): HttpClient;
}

const HTTP: HttpModule = {
  client(options) {
    return axiosCaseConverter(axios.create(options));
  },
};

export default HTTP;
