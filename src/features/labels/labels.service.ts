import { addDoc, collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore'

import { db } from '@/lib/firebase'
import type { Label, LabelInput } from '@/types/models'

const labelsCollection = (userId: string) => collection(db, 'users', userId, 'labels')

export function subscribeToLabels(userId: string, next: (labels: Label[]) => void) {
  return onSnapshot(labelsCollection(userId), (snapshot) => {
    next(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as Label))
  })
}

export function addLabel(userId: string, input: LabelInput) {
  return addDoc(labelsCollection(userId), input)
}

export function deleteLabel(userId: string, labelId: string) {
  return deleteDoc(doc(db, 'users', userId, 'labels', labelId))
}
