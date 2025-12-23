import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  writeBatch
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
    // Ensure order exists for legacy tasks
    order: data.order ?? data.createdAt ?? 0 
  };
};

export const fetchTasksForDate = async (userId: string, dateStr: string): Promise<Task[]> => {
  // GUEST MODE
  if (userId === 'guest') {
    const allTasks = getLocalTasks();
    const filtered = allTasks.filter(t => t.date === dateStr && t.userId === 'guest');
    // Sort by order first, then createdAt
    return filtered.sort((a, b) => {
      const orderA = a.order ?? a.createdAt;
      const orderB = b.order ?? b.createdAt;
      return orderA - orderB;
    });
  }

  // FIREBASE MODE
  if (!db) {
    console.error("Database not initialized");
    return [];
  }

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
    
    // Sort manually on client side to handle mixed legacy data smoothly
    return tasks.sort((a, b) => {
        const orderA = a.order ?? a.createdAt;
        const orderB = b.order ?? b.createdAt;
        return orderA - orderB;
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

export const fetchTasksForMonth = async (userId: string, startStr: string, endStr: string): Promise<Task[]> => {
  // GUEST MODE
  if (userId === 'guest') {
    const allTasks = getLocalTasks();
    return allTasks.filter(t => t.userId === 'guest' && t.date >= startStr && t.date <= endStr);
  }

  // FIREBASE MODE
  if (!db) return [];

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
  // Get current tasks count/max order to append
  let nextOrder = Date.now(); // Default to timestamp
  
  // Try to find the max order of existing tasks for this day to append to bottom
  try {
      const existing = await fetchTasksForDate(userId, dateStr);
      if (existing.length > 0) {
          const maxOrder = Math.max(...existing.map(t => t.order ?? 0));
          nextOrder = maxOrder + 100; // Add gap for easier reordering later
      } else {
          nextOrder = 0;
      }
  } catch(e) { /* ignore */ }

  const newTask: Task = {
    id: userId === 'guest' ? `guest_${Date.now()}` : '', 
    content,
    isCompleted: false,
    date: dateStr,
    userId,
    createdAt: Date.now(),
    order: nextOrder
  };

  // GUEST MODE
  if (userId === 'guest') {
    const tasks = getLocalTasks();
    tasks.push(newTask);
    setLocalTasks(tasks);
    return newTask;
  }

  // FIREBASE MODE
  if (!db) return null;

  try {
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
  if (!db) return;

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
  if (!db) return;

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
  if (!db) return;

  try {
    const taskRef = doc(db, `users/${userId}/${TASKS_COLLECTION}`, taskId);
    await updateDoc(taskRef, { content });
  } catch (error) {
    console.error("Error updating task content:", error);
  }
};

// NEW: Batch update order
export const updateTasksOrder = async (userId: string, tasks: Task[]): Promise<void> => {
    // GUEST MODE
    if (userId === 'guest') {
        const allTasks = getLocalTasks();
        // Create a map of the new orders for the tasks being updated
        const updateMap = new Map(tasks.map(t => [t.id, t.order]));
        
        const updatedAll = allTasks.map(t => {
            if (updateMap.has(t.id)) {
                return { ...t, order: updateMap.get(t.id)! };
            }
            return t;
        });
        setLocalTasks(updatedAll);
        return;
    }

    // FIREBASE MODE
    if (!db) return;

    try {
        const batch = writeBatch(db);
        tasks.forEach(task => {
            const docRef = doc(db, `users/${userId}/${TASKS_COLLECTION}`, task.id);
            batch.update(docRef, { order: task.order });
        });
        await batch.commit();
    } catch (error) {
        console.error("Error updating task order:", error);
    }
};