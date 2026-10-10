import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import type { LabelInput, SharedCanvas } from '@/types/models'

/**
 * Snapshot a project into the public `sharedCanvases` collection and return the
 * id used in the share link. The snapshot is immutable.
 */
export async function shareCanvas(
  projectId: string,
  userId: string,
  name: string,
): Promise<string> {
  const [issuesSnapshot, labelsSnapshot] = await Promise.all([
    getDocs(collection(db, 'projects', projectId, 'issues')),
    getDocs(collection(db, 'users', userId, 'labels')),
  ])

  const sharedRef = await addDoc(collection(db, 'sharedCanvases'), {
    name,
    originalOwnerId: userId,
    sharedAt: serverTimestamp(),
    labelsSnapshot: labelsSnapshot.docs.map((entry) => {
      const { name: labelName, color } = entry.data()
      return { name: labelName, color } as LabelInput
    }),
  })

  const batch = writeBatch(db)
  for (const issue of issuesSnapshot.docs) {
    const { id: _id, ...data } = issue.data()
    batch.set(doc(collection(db, 'sharedCanvases', sharedRef.id, 'issues')), data)
  }
  await batch.commit()

  return sharedRef.id
}

export async function getSharedCanvas(shareId: string): Promise<SharedCanvas | null> {
  const snapshot = await getDoc(doc(db, 'sharedCanvases', shareId))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as SharedCanvas
}

/** Clone a shared canvas into the signed-in user's own projects. */
export async function importSharedCanvas(
  shareId: string,
  userId: string,
  canvas: SharedCanvas,
): Promise<string> {
  const [issuesSnapshot, userLabelsSnapshot] = await Promise.all([
    getDocs(collection(db, 'sharedCanvases', shareId, 'issues')),
    getDocs(collection(db, 'users', userId, 'labels')),
  ])

  const existingLabelNames = new Set(
    userLabelsSnapshot.docs.map((entry) => entry.data().name as string),
  )
  const newLabels = (canvas.labelsSnapshot ?? []).filter(
    (label) => !existingLabelNames.has(label.name),
  )

  if (newLabels.length > 0) {
    const labelBatch = writeBatch(db)
    for (const label of newLabels) {
      labelBatch.set(doc(collection(db, 'users', userId, 'labels')), label)
    }
    await labelBatch.commit()
  }

  const projectRef = await addDoc(collection(db, 'projects'), {
    name: `Copy of ${canvas.name}`,
    ownerId: userId,
    createdAt: serverTimestamp(),
  })

  const issueBatch = writeBatch(db)
  for (const issue of issuesSnapshot.docs) {
    const { id: _id, ...data } = issue.data()
    issueBatch.set(doc(collection(db, 'projects', projectRef.id, 'issues')), data)
  }
  await issueBatch.commit()

  return projectRef.id
}
