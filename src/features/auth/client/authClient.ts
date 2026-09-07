import { href } from 'one'

import { SERVER_URL } from '~/constants/urls'
import { createBetterAuthClient } from '~/helpers/createBetterAuthClient'
import { showToast } from '~/interface/toast/Toast'

import { plugins } from './plugins'

import type { User } from 'better-auth'

/**
 * better-auth's `User` only carries the core columns. Our `user` table also has
 * a nullable `username` (see `src/database/schema-private.ts`), which
 * `afterCreateUser` populates and the profile/header UI reads.
 */
type AppUser = User & { role?: 'admin'; username?: string | null }

const betterAuthClient = createBetterAuthClient({
  baseURL: SERVER_URL,
  plugins,
  createUser: (user) => user as AppUser,
  onAuthError: (error: any) => {
    showToast(`Auth error: ${error.message || JSON.stringify(error)}`, {
      type: 'error',
    })
  },
})

export const useAuth = () => {
  const auth = betterAuthClient.useAuth()
  return {
    ...auth,
    loginText: auth.state === 'logged-in' ? 'Account' : 'Login',
    loginLink: href(auth.state === 'logged-in' ? '/home/feed' : '/auth/login'),
  }
}

export const { setAuthClientToken, clearAuthClientToken, authState, authClient } =
  betterAuthClient
