import axios, { AxiosError, type AxiosResponse } from 'axios'
// import { useMessage } from "naive-ui";

export interface RequestCallbacks {
  before?: () => Promise<void>
  success?: (data: any) => Promise<void>
  error?: (errorMsg: string) => Promise<void>
}

type RequestMethod = 'post' | 'get'

interface RequestInstance {
  postData: (url: string, data: any, callback?: RequestCallbacks) => Promise<any>
  getData: (url: string, callback?: RequestCallbacks) => Promise<any>
}

let instance: RequestInstance | null = null

export const useRequestMethod = (): RequestInstance => {
  if (instance) return instance

  //   const message = useMessage();

  async function axiosRequest(
    url: string,
    data: any,
    method: RequestMethod = 'post',
    callback: RequestCallbacks | null = null,
  ): Promise<any> {
    try {
      if (callback?.before) await callback.before()

      let response: AxiosResponse<any, any>
      if (method === 'post') {
        response = await axios.post(`${import.meta.env.VITE_API_URL}/${url}`, data)
      } else {
        response = await axios.get(`${import.meta.env.VITE_API_URL}/${url}`)
      }

      if (callback?.success) await callback.success(response.data)
      return response.data
    } catch (error) {
      let errorMsg = ''
      const axiosError = error as AxiosError

      if (axiosError.response) {
        errorMsg = `响应状态码: ${
          axiosError.response.status
        }, 响应数据: ${JSON.stringify(axiosError.response.data, null, 2)}`
      } else if (axiosError.request) {
        errorMsg = '没有收到响应'
      } else {
        errorMsg = `错误信息: ${axiosError.message}`
      }

      if (callback?.error) await callback.error(errorMsg)
      throw error
    }
  }

  const postData = async (
    url: string,
    data: any,
    callback: RequestCallbacks | null = null,
  ): Promise<any> => {
    return await axiosRequest(url, data, 'post', callback)
  }

  const getData = async (url: string, callback: RequestCallbacks | null = null): Promise<any> => {
    return await axiosRequest(url, null, 'get', callback)
  }

  instance = {
    postData,
    getData,
  }
  return instance
}
