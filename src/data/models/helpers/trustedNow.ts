import type { MutatorContext } from 'on-zero'

/**
 * the client's `now` is an optimistic hint, never an authority: quota buckets,
 * schedules and audit timestamps derived from it would all be forgeable by a
 * client that lies about its clock. on the server, use the server's clock.
 */
export function trustedNow(ctx: MutatorContext, clientNow: number): number {
  return ctx.environment === 'server' ? Date.now() : clientNow
}
