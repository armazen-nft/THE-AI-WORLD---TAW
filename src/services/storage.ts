import { Paper, UserNote } from '../types/academic';

const BOOKMARKS_KEY = 'datasphere_bookmarks';
const NOTES_KEY = 'datasphere_notes';
const CACHED_PAPERS_KEY = 'datasphere_cached_papers';

export function getBookmarks(): string[] {
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(paperId: string): boolean {
  const current = getBookmarks();
  const exists = current.includes(paperId);
  const updated = exists ? current.filter((id) => id !== paperId) : [...current, paperId];
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Storage write error:', e);
  }
  return !exists;
}

export function getNotes(paperId?: string): UserNote[] {
  try {
    const data = localStorage.getItem(NOTES_KEY);
    const allNotes: UserNote[] = data ? JSON.parse(data) : [];
    if (paperId) {
      return allNotes.filter((n) => n.paperId === paperId);
    }
    return allNotes;
  } catch {
    return [];
  }
}

export function addNote(paperId: string, content: string, highlightText?: string): UserNote {
  const note: UserNote = {
    id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    paperId,
    content,
    createdAt: new Date().toISOString(),
    highlightText,
  };
  const current = getNotes();
  const updated = [note, ...current];
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Notes write error:', e);
  }
  return note;
}

export function deleteNote(noteId: string): void {
  const current = getNotes();
  const updated = current.filter((n) => n.id !== noteId);
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Notes write error:', e);
  }
}

export function cachePapersForOffline(papers: Paper[]): void {
  try {
    localStorage.setItem(CACHED_PAPERS_KEY, JSON.stringify(papers));
  } catch (e) {
    console.warn('Could not cache all papers offline:', e);
  }
}

export function getCachedPapers(): Paper[] | null {
  try {
    const data = localStorage.getItem(CACHED_PAPERS_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}
