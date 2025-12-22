import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Task } from '../types';

const TASKS_COLLECTION = 'tasks';
const GUEST_STORAGE_KEY = 'focusflow_guest_tasks';

// --- Local Storage Helpers for Guest Mode ---
const getLocalTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const setLocalTasks = (tasks: Task[]) => {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(tasks));
};

// Helper to convert Firestore doc to Task type
const docToTask = (doc: any): Task => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  };
};

export const fetchTasksForDate = async (userId: string, dateStr: string): Promise<Task[]> => {
  // GUEST MODE
  if (userId === 'guest') {
    const allTasks = getLocalTasks();
    const filtered = allTasks.filter(t => t.date === dateStr && t.userId === 'guest');
    return filtered.sort((a, b) => a.createdAt - b.createdAt);
  }

  // FIREBASE MODE
  try {
    const q = query(
      collection(db, `users/${userId}/${TASKS_COLLECTION}`),
      where('date', '==', dateStr)
    );
    
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      tasks.push(docToTask(doc));
    });
    
    return tasks.sort((a, b) => a.createdAt - b.createdAt);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

// NEW: Fetch tasks for a whole month range to populate calendar dots
export const fetchTasksForMonth = async (userId: string, startStr: string, endStr: string): Promise<Task[]> => {
  // GUEST MODE
  if (userId === 'guest') {
    const allTasks = getLocalTasks();
    // Filter string date range
    return allTasks.filter(t => t.userId === 'guest' && t.date >= startStr && t.date <= endStr);
  }

  // FIREBASE MODE
  try {
    const q = query(
      collection(db, `users/${userId}/${TASKS_COLLECTION}`),
      where('date', '>=', startStr),
      where('date', '<=', endStr)
    );

    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      tasks.push(docToTask(doc));
    });
    return tasks;
  } catch (error) {
    console.error("Error fetching monthly tasks:", error);
    return [];
  }
};

export const addTask = async (userId: string, content: string, dateStr: string): Promise<Task | null> => {
  const newTask: Task = {
    id: userId === 'guest' ? `guest_${Date.now()}` : '', // ID assigned later for firebase
    content,
    isCompleted: false,
    date: dateStr,
    userId,
    createdAt: Date.now(),
  };

  // GUEST MODE
  if (userId === 'guest') {
    const tasks = getLocalTasks();
    tasks.push(newTask);
    setLocalTasks(tasks);
    return newTask;
  }

  // FIREBASE MODE
  try {
    // Remove ID before sending to Firestore (let Firestore generate it)
    const { id, ...taskData } = newTask;
    const docRef = await addDoc(collection(db, `users/${userId}/${TASKS_COLLECTION}`), taskData);
    return { ...newTask, id: docRef.id };
  } catch (error) {
    console.error("Error adding task:", error);
    return null;
  }
};

export const toggleTaskCompletion = async (userId: string, taskId: string, isCompleted: boolean): Promise<void> => {
  // GUEST MODE
  if (userId === 'guest') {
    const tasks = getLocalTasks();
    const updated = tasks.map(t => t.id === taskId ? { ...t, isCompleted } : t);
    setLocalTasks(updated);
    return;
  }

  // FIREBASE MODE
  try {
    const taskRef = doc(db, `users/${userId}/${TASKS_COLLECTION}`, taskId);
    await updateDoc(taskRef, { isCompleted });
  } catch (error) {
    console.error("Error updating task:", error);
  }
};

export const deleteTask = async (userId: string, taskId: string): Promise<void> => {
  // GUEST MODE
  if (userId === 'guest') {
    const tasks = getLocalTasks();
    const updated = tasks.filter(t => t.id !== taskId);
    setLocalTasks(updated);
    return;
  }

  // FIREBASE MODE
  try {
    const taskRef = doc(db, `users/${userId}/${TASKS_COLLECTION}`, taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};

export const updateTaskContent = async (userId: string, taskId: string, content: string): Promise<void> => {
  // GUEST MODE
  if (userId === 'guest') {
    const tasks = getLocalTasks();
    const updated = tasks.map(t => t.id === taskId ? { ...t, content } : t);
    setLocalTasks(updated);
    return;
  }

  // FIREBASE MODE
  try {
    const taskRef = doc(db, `users/${userId}/${TASKS_COLLECTION}`, taskId);
    await updateDoc(taskRef, { content });
  } catch (error) {
    console.error("Error updating task content:", error);
  }
};