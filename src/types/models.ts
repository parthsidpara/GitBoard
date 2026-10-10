import type { Timestamp } from 'firebase/firestore'

/** A label definition owned by a user. Colour is a hex string. */
export interface Label {
  id: string
  name: string
  color: string
}

/** A label before it has been persisted (no id yet). */
export type LabelInput = Omit<Label, 'id'>

/**
 * A GitHub issue plotted on the matrix. Position is normalized to 0..1,
 * with `y` measured from the bottom so the value is resolution independent.
 */
export interface Issue {
  id: string
  number: string
  title: string
  url: string
  labels: string[]
  x: number
  y: number
}

/** The editable fields of an issue, before a position is assigned. */
export type IssueInput = Omit<Issue, 'id' | 'x' | 'y'>

export interface Project {
  id: string
  name: string
  ownerId: string
  createdAt: Timestamp | null
}

export interface SharedCanvas {
  id: string
  name: string
  originalOwnerId: string
  sharedAt: Timestamp | null
  labelsSnapshot: LabelInput[]
}

/** The four Eisenhower quadrants, keyed by the action they imply. */
export type Quadrant = 'do' | 'schedule' | 'delegate' | 'delete'

/** Raw issue shape returned by the GitHub REST API. */
export interface GitHubIssue {
  id: number
  number: number
  title: string
  html_url: string
  labels: { id: number; name: string; color: string }[]
  pull_request?: unknown
}
