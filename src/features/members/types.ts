export type MemberRole = 'admin' | 'member'

export interface Member {
  id: string
  name: string
  role: MemberRole
}

export interface MemberComposerState {
  name: string
  role: MemberRole
}
