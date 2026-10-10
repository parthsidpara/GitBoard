import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import type { Project } from '@/types/models'

const projectsCollection = () => collection(db, 'projects')

export function subscribeToProjects(userId: string, next: (projects: Project[]) => void) {
  const projectsQuery = query(projectsCollection(), where('ownerId', '==', userId))
  return onSnapshot(projectsQuery, (snapshot) => {
    const projects = snapshot.docs
      .map((entry) => ({ id: entry.id, ...entry.data() }) as Project)
      .toSorted((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
    next(projects)
  })
}

export function subscribeToProject(projectId: string, next: (project: Project | null) => void) {
  return onSnapshot(doc(db, 'projects', projectId), (snapshot) => {
    next(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Project) : null)
  })
}

export async function createProject(userId: string, name = 'Untitled Canvas'): Promise<string> {
  const ref = await addDoc(projectsCollection(), {
    name,
    ownerId: userId,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export function renameProject(projectId: string, name: string) {
  return updateDoc(doc(db, 'projects', projectId), { name })
}

export function deleteProject(projectId: string) {
  return deleteDoc(doc(db, 'projects', projectId))
}
