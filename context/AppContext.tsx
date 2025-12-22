import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import * as firebaseAuth from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { format, addDays } from 'date-fns';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import vi from 'date-fns/locale/vi';
import { Task, User } from '../types';
import * as taskService from '../services/taskService';

// Translation Dictionary
const translations: Record<string, Record<string, string>> = {
  en: {
    // Auth
    "app_title": "FocusFlow",
    "auth_subtitle": "Master your day with the Ivy Lee Method & Pomodoro Technique.",
    "signin_google": "Sign in with Google",
    "continue_guest": "Continue as Guest",
    "or": "OR",
    "auth_limit_msg": "Strict limit of 5 tasks per day.",
    "auth_focus_msg": "Pure focus. No distractions.",
    "auth_error_domain": "Access Denied: The current domain is not authorized in the Firebase Console.\n\nIf you are viewing this in a preview environment, please use 'Continue as Guest' instead.",
    "auth_error_config": "Firebase configuration issue detected. Please use 'Continue as Guest' to test the app.",
    "sign_in_failed": "Sign in failed.",

    // Dashboard
    "sign_out": "Sign Out",
    "pro_tip_title": "Pro Tip",
    "pro_tip_content": "Combine the Pomodoro timer with the Ivy Lee method. Start the timer, pick your top task, and don't stop until the timer rings.",

    // Calendar
    "go_today": "Go to Today",

    // Task List
    "tasks_header": "Tasks",
    "sync": "Sync to Google Calendar",
    "syncing": "Syncing...",
    "sync_success": "Successfully added {n} tasks to your Google Calendar!",
    "sync_error": "Failed to sync. Please try again or re-login.",
    "sync_guest_error": "Sign in with Google to use Calendar Sync.",
    "add_placeholder": "Add a new task...",
    "limit_reached": "Daily limit reached (5 tasks)",
    "no_tasks": "No tasks for this day.",
    "no_tasks_sub": "Focus on what matters most.",
    "ivy_lee_tip": "Ivy Lee Method: Limit yourself to the 6 most important things (we use 5 for extra focus).",
    
    // Modal
    "modal_title": "Complete Task?",
    "modal_desc": "Have you fully completed",
    "modal_keep": "Keep working",
    "modal_confirm": "Yes, Complete",

    // Pomodoro
    "pomo_focus": "Focus",
    "pomo_break": "Break",
    "pomo_status_focus_active": "Stay focused on one task.",
    "pomo_status_break_active": "Relax and recharge.",
    "pomo_status_focus_idle": "Ready to focus?",
    "pomo_status_break_idle": "Ready to break?",
    
    // Pomodoro Notifications
    "pomo_done_focus_title": "Focus Session Complete!",
    "pomo_done_focus_msg": "Great job. Take a short break.",
    "pomo_done_break_title": "Break Time Over!",
    "pomo_done_break_msg": "Time to get back to work."
  },
  vi: {
    // Auth
    "app_title": "FocusFlow",
    "auth_subtitle": "Làm chủ ngày của bạn với Phương pháp Ivy Lee & Pomodoro.",
    "signin_google": "Đăng nhập bằng Google",
    "continue_guest": "Tiếp tục với tư cách Khách",
    "or": "HOẶC",
    "auth_limit_msg": "Giới hạn nghiêm ngặt 5 công việc mỗi ngày.",
    "auth_focus_msg": "Tập trung tuyệt đối. Không xao nhãng.",
    "auth_error_domain": "Truy cập bị từ chối: Tên miền hiện tại chưa được ủy quyền trong Firebase Console.\n\nNếu bạn đang xem bản xem trước, vui lòng sử dụng 'Tiếp tục với tư cách Khách'.",
    "auth_error_config": "Phát hiện lỗi cấu hình Firebase. Vui lòng sử dụng 'Tiếp tục với tư cách Khách' để kiểm thử ứng dụng.",
    "sign_in_failed": "Đăng nhập thất bại.",

    // Dashboard
    "sign_out": "Đăng xuất",
    "pro_tip_title": "Mẹo nhỏ",
    "pro_tip_content": "Kết hợp đồng hồ Pomodoro với phương pháp Ivy Lee. Bắt đầu hẹn giờ, chọn việc quan trọng nhất và đừng dừng lại cho đến khi chuông reo.",

    // Calendar
    "go_today": "Về hôm nay",

    // Task List
    "tasks_header": "Công việc",
    "sync": "Đồng bộ Google Calendar",
    "syncing": "Đang đồng bộ...",
    "sync_success": "Đã thêm thành công {n} công việc vào Google Calendar!",
    "sync_error": "Đồng bộ thất bại. Vui lòng thử lại hoặc đăng nhập lại.",
    "sync_guest_error": "Vui lòng đăng nhập Google để sử dụng tính năng này.",
    "add_placeholder": "Thêm công việc mới...",
    "limit_reached": "Đã đạt giới hạn ngày (5 việc)",
    "no_tasks": "Chưa có công việc cho ngày này.",
    "no_tasks_sub": "Tập trung vào điều quan trọng nhất.",
    "ivy_lee_tip": "Phương pháp Ivy Lee: Giới hạn bản thân ở 6 việc quan trọng nhất (chúng tôi dùng 5 để tăng sự tập trung).",
    
    // Modal
    "modal_title": "Hoàn thành?",
    "modal_desc": "Bạn đã thực sự hoàn thành",
    "modal_keep": "Chưa xong",
    "modal_confirm": "Xong rồi",

    // Pomodoro
    "pomo_focus": "Tập trung",
    "pomo_break": "Nghỉ ngơi",
    "pomo_status_focus_active": "Hãy tập trung vào một việc duy nhất.",
    "pomo_status_break_active": "Thư giãn và nạp năng lượng.",
    "pomo_status_focus_idle": "Sẵn sàng tập trung?",
    "pomo_status_break_idle": "Sẵn sàng nghỉ ngơi?",

    // Pomodoro Notifications
    "pomo_done_focus_title": "Đã hết thời gian tập trung!",
    "pomo_done_focus_msg": "Làm tốt lắm. Hãy nghỉ ngơi chút nhé.",
    "pomo_done_break_title": "Đã hết giờ nghỉ!",
    "pomo_done_break_msg": "Đến lúc quay lại làm việc rồi."
  }
};

type Language = 'en' | 'vi';

export interface DayStatus {
  total: number;
  completed: number;
}

interface AppContextType {
  user: User | null;
  loadingAuth: boolean;
  selectedDate: Date;
  tasks: Task[];
  loadingTasks: boolean;
  language: Language;
  monthlyStats: Record<string, DayStatus>; // 'YYYY-MM-DD' -> Status
  toggleLanguage: () => void;
  t: (key: string) => string;
  locale: any; // date-fns locale
  signIn: () => Promise<void>;
  signInAsGuest: () => void;
  logout: () => Promise<void>;
  setSelectedDate: (date: Date) => void;
  addNewTask: (content: string) => Promise<void>;
  toggleTask: (task: Task) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  editTask: (taskId: string, newContent: string) => Promise<void>;
  refreshTasks: () => void;
  fetchMonthlyStats: (monthDate: Date) => Promise<void>;
  syncTasksToGoogleCalendar: (tasksToSync: Task[], date: Date) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [monthlyStats, setMonthlyStats] = useState<Record<string, DayStatus>>({});

  // Auth Listener
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(auth, (currentUser: FirebaseUser | null) => {
      if (user?.uid === 'guest') return;
      setUser(currentUser as unknown as User);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch Tasks for selected date
  const fetchTasks = async () => {
    if (!user) return;
    setLoadingTasks(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const fetched = await taskService.fetchTasksForDate(user.uid, dateStr);
    setTasks(fetched);
    setLoadingTasks(false);
  };

  useEffect(() => {
    fetchTasks();
    // Also fetch monthly stats for the currently selected month context
    fetchMonthlyStats(selectedDate);
  }, [user, selectedDate]);

  const fetchMonthlyStats = async (monthDate: Date) => {
    if (!user) return;
    
    const start = format(startOfMonth(monthDate), 'yyyy-MM-dd');
    const end = format(endOfMonth(monthDate), 'yyyy-MM-dd');
    
    const monthTasks = await taskService.fetchTasksForMonth(user.uid, start, end);
    
    // Aggregate stats
    const stats: Record<string, DayStatus> = {};
    monthTasks.forEach(task => {
        if (!stats[task.date]) {
            stats[task.date] = { total: 0, completed: 0 };
        }
        stats[task.date].total += 1;
        if (task.isCompleted) {
            stats[task.date].completed += 1;
        }
    });
    
    // Merge with existing to avoid flickering when switching months but keeping cache
    setMonthlyStats(prev => ({ ...prev, ...stats }));
  };

  // Language Helpers
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'vi' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Auth Functions
  const signIn = async () => {
    try {
      const result = await firebaseAuth.signInWithPopup(auth, googleProvider);
      const credential = firebaseAuth.GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
      }
    } catch (error: any) {
      console.error("Sign in failed", error);
      let msg = t('sign_in_failed');
      if (error.code === 'auth/unauthorized-domain') {
        msg = t('auth_error_domain');
      } else if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/configuration-not-found') {
        msg = t('auth_error_config');
      } else if (error.message) {
        msg = `Error: ${error.message}`;
      }
      alert(msg);
    }
  };

  const signInAsGuest = () => {
    setUser({
      uid: 'guest',
      displayName: language === 'vi' ? 'Khách' : 'Guest User',
      email: 'guest@example.com',
      photoURL: null,
    } as User);
    setLoadingAuth(false);
  };

  const logout = async () => {
    if (user?.uid === 'guest') {
      setUser(null);
    } else {
      await firebaseAuth.signOut(auth);
      setAccessToken(null);
    }
    setTasks([]);
    setMonthlyStats({});
  };

  // Task Operations
  const addNewTask = async (content: string) => {
    if (!user) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const newTask = await taskService.addTask(user.uid, content, dateStr);
    if (newTask) {
        setTasks(prev => [...prev, newTask]);
        // Optimistic update for stats
        setMonthlyStats(prev => {
            const current = prev[dateStr] || { total: 0, completed: 0 };
            return {
                ...prev,
                [dateStr]: { ...current, total: current.total + 1 }
            };
        });
    }
  };

  const toggleTask = async (task: Task) => {
    if (!user) return;
    const newState = !task.isCompleted;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isCompleted: newState } : t));
    await taskService.toggleTaskCompletion(user.uid, task.id, newState);
    
    // Update stats
    const dateStr = task.date;
    setMonthlyStats(prev => {
        const current = prev[dateStr];
        if(!current) return prev;
        return {
            ...prev,
            [dateStr]: { 
                ...current, 
                completed: newState ? current.completed + 1 : current.completed - 1 
            }
        };
    });
  };

  const removeTask = async (taskId: string) => {
    if (!user) return;
    const taskToRemove = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    await taskService.deleteTask(user.uid, taskId);

    if (taskToRemove) {
        const dateStr = taskToRemove.date;
        setMonthlyStats(prev => {
            const current = prev[dateStr];
            if(!current) return prev;
            return {
                ...prev,
                [dateStr]: { 
                    total: current.total - 1,
                    completed: taskToRemove.isCompleted ? current.completed - 1 : current.completed
                }
            };
        });
    }
  };

  const editTask = async (taskId: string, newContent: string) => {
    if(!user) return;
    setTasks(prev => prev.map(t => t.id === taskId ? {...t, content: newContent} : t));
    await taskService.updateTaskContent(user.uid, taskId, newContent);
  }

  // Google Calendar Sync
  const syncTasksToGoogleCalendar = async (tasksToSync: Task[], date: Date) => {
      if (user?.uid === 'guest') {
          throw new Error('guest_mode');
      }

      let token = accessToken;
      
      if (!token) {
        try {
            const result = await firebaseAuth.signInWithPopup(auth, googleProvider);
            const credential = firebaseAuth.GoogleAuthProvider.credentialFromResult(result);
            token = credential?.accessToken || null;
            if (token) setAccessToken(token);
        } catch (e) {
            console.error("Auth for sync failed", e);
            throw new Error('auth_failed');
        }
      }

      if (!token) throw new Error('no_token');

      const startStr = format(date, 'yyyy-MM-dd');
      const endStr = format(addDays(date, 1), 'yyyy-MM-dd');

      const promises = tasksToSync.map(task => {
          const event = {
              summary: `[FocusFlow] ${task.content}`,
              description: `Created via FocusFlow on ${startStr}`,
              start: { date: startStr },
              end: { date: endStr },
              transparency: "transparent"
          };

          return fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(event)
          }).then(async res => {
              if (!res.ok) {
                  const err = await res.json();
                  throw new Error(err.error?.message || 'API Error');
              }
              return res.json();
          });
      });

      await Promise.all(promises);
  };

  return (
    <AppContext.Provider value={{
      user,
      loadingAuth,
      selectedDate,
      tasks,
      loadingTasks,
      language,
      monthlyStats,
      toggleLanguage,
      t,
      locale: language === 'vi' ? vi : undefined,
      signIn,
      signInAsGuest,
      logout,
      setSelectedDate,
      addNewTask,
      toggleTask,
      removeTask,
      editTask,
      refreshTasks: fetchTasks,
      fetchMonthlyStats,
      syncTasksToGoogleCalendar
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};