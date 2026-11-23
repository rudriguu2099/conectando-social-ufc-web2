import axios from 'axios'
import { localStorageKeys } from '@/app/config/localStorageKeys'

const apiUrl = import.meta.env.VITE_API_URL + '/api'

export const httpClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(localStorageKeys.ACCESS_TOKEN)

  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})
