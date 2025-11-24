import type { AxiosRequestConfig } from "axios";

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  requireAuth?: boolean,
  _retyr?: boolean
}