import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'

import { randomLabelColor } from '@/lib/colors'
import { db } from '@/lib/firebase'
import type { Issue, IssueInput } from '@/types/models'

const issuesCollection = (projectId: string) => collection(db, 'projects', projectId, 'issues')

export function subscribeToIssues(projectId: string, next: (issues: Issue[]) => void) {
  return onSnapshot(issuesCollection(projectId), (snapshot) => {
    next(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as Issue))
  })
}

export function addIssue(projectId: string, input: IssueInput) {
  return addDoc(issuesCollection(projectId), { ...input, x: 0.5, y: 0.5 })
}

export function updateIssue(projectId: string, issueId: string, input: IssueInput) {
  return updateDoc(doc(db, 'projects', projectId, 'issues', issueId), input)
}

export function updateIssuePosition(
  projectId: string,
  issueId: string,
  position: { x: number; y: number },
) {
  return updateDoc(doc(db, 'projects', projectId, 'issues', issueId), position)
}

export function deleteIssue(projectId: string, issueId: string) {
  return deleteDoc(doc(db, 'projects', projectId, 'issues', issueId))
}

const ISSUES_PER_COLUMN = 11
const COLUMN_WIDTH = 0.07
const ROW_HEIGHT = 0.09
const START_X = 0.05
const START_Y = 0.05

/** Lay imported issues out in a tidy column-major grid. */
function gridPosition(index: number): { x: number; y: number } {
  const column = Math.floor(index / ISSUES_PER_COLUMN)
  const row = index % ISSUES_PER_COLUMN
  return {
    x: START_X + column * COLUMN_WIDTH,
    y: 1 - (START_Y + row * ROW_HEIGHT),
  }
}

/**
 * Import issues in two batched writes: first create any labels the user does not
 * already have, then write the issues onto the canvas.
 */
export async function importIssues(
  projectId: string,
  userId: string,
  existingLabelNames: Set<string>,
  inputs: IssueInput[],
): Promise<void> {
  if (inputs.length === 0) return

  const importedLabelNames = new Set(inputs.flatMap((issue) => issue.labels))
  const newLabelNames = [...importedLabelNames].filter((name) => !existingLabelNames.has(name))

  if (newLabelNames.length > 0) {
    const labelBatch = writeBatch(db)
    const labelsRef = collection(db, 'users', userId, 'labels')
    for (const name of newLabelNames) {
      labelBatch.set(doc(labelsRef), { name, color: randomLabelColor() })
    }
    await labelBatch.commit()
  }

  const issueBatch = writeBatch(db)
  const issuesRef = issuesCollection(projectId)
  inputs.forEach((issue, index) => {
    issueBatch.set(doc(issuesRef), { ...issue, ...gridPosition(index) })
  })
  await issueBatch.commit()
}
