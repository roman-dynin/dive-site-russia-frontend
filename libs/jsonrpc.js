export const request = async (axios, method, params) => {
  const { result } = await axios.$post(
    '/api/v1/jsonrpc',
    {
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    }
  )

  return result
}
