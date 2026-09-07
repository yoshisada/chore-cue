export async function prettyPrintResponse(responseIn: Response): Promise<void> {
  const response = responseIn.clone()

  const headersOut: Record<string, unknown> = {}
  responseIn.headers.forEach((value, key) => {
    headersOut[key] = value
  })

  const responseDetails = {
    status: response.status,
    statusText: response.statusText,
    headers: headersOut,
    body: response.body ? await streamToString(response.body) : null,
  }

  console.info(responseDetails)
}

async function streamToString(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let result = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      result += decoder.decode(value, { stream: true })
    }
  } catch (error) {
    console.error('Error reading the stream:', error)
  } finally {
    reader.releaseLock()
  }

  return result
}
