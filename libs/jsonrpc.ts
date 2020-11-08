import {
  NuxtAxiosInstance
} from '@nuxtjs/axios'

/**
 * JSON RPC запрос
 *
 * @param  {NuxtAxiosInstance} axios
 * @param  {string} method
 * @param  {object} params
 * @param  {(string|null)} extractByKey
 *
 * @return {*}
 */
export const request = async (
  axios: NuxtAxiosInstance,
  method: string,
  params: object,
  extractByKey: string | null
): Promise<unknown> => {
  const { result } = await axios.$post(
    '/api/v1/jsonrpc',
    {
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    }
  )

  return extractByKey ? result[extractByKey] : result
}
