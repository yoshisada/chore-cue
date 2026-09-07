import { createEmitter, isEqualNever } from '~/helpers/emitter'

export const scrollToTopEmitter = createEmitter<'home' | false>('scrollToTop', false, {
  comparator: isEqualNever,
})
