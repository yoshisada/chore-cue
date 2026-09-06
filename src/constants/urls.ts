import { getURL } from 'one'

// TODO

// Server URLs configuration
// Force localhost on client to avoid 0.0.0.0 CORS issues
const rawServerUrl = process.env.ONE_SERVER_URL || 'http://localhost:8081'

// getURL() returns this when the bundle is not served by a dev server, i.e. a release build.
const RELEASE_BUILD_URL = 'http://one-server.example.com'

export const SERVER_URL = (() => {
  // For production and staging web, we can infer the server URL from location.
  if (typeof location !== 'undefined') {
    return `${location.protocol}//${location.host}`
  }

  // In dev build this will return the dev server URL where the bundle is being served from.
  const url = getURL()

  // FIXME?: [One] prod ONE_SERVER_URL not working in metro
  if (url === RELEASE_BUILD_URL) {
    // No default here on purpose: a release build must be told where its own backend
    // lives, rather than silently pointing auth/API traffic at someone else's server.
    const configured = import.meta.env.VITE_PUBLIC_SERVER
    if (!configured) {
      throw new Error(
        `Missing VITE_PUBLIC_SERVER: a release build must set the server URL.`
      )
    }
    return configured
  }
  return url
})()

export const ZERO_SERVER_URL = (() => {
  const explicit = import.meta.env.VITE_PUBLIC_ZERO_SERVER
  if (explicit) {
    return explicit
  }

  // In dev build this will return the dev server URL where the bundle is being served from.
  const serverUrl = getURL()
  if (serverUrl === RELEASE_BUILD_URL) {
    // Same as above: never fall back to a sync server we don't control.
    throw new Error(
      `Missing VITE_PUBLIC_ZERO_SERVER: a release build must set the Zero sync server URL.`
    )
  }

  // On native (Expo Go / device), use same host as Metro but port 4948 so the device
  // can reach the Zero server on the host (localhost on device would be the device itself).
  try {
    const u = new URL(serverUrl)
    u.port = '4948'
    return u.toString()
  } catch {
    return 'http://localhost:4948'
  }
})()

export const API_URL = `${SERVER_URL}/api`
export const AUTH_URL = `${SERVER_URL}/api/auth`
