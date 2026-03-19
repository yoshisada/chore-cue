import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('feed route', () => {
  it('imports ChoreHomePage instead of the Takeout todo demo', () => {
    const feedPath = resolve(__dirname, '../../../../app/(app)/home/(tabs)/feed/index.tsx')
    const source = readFileSync(feedPath, 'utf-8')

    expect(source).toContain('ChoreHomePage')
    expect(source).not.toContain('TodoPage')
    expect(source).not.toContain('todo')
  })
})
