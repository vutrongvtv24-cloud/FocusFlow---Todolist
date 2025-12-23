import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Check, Trash2, Edit2, Calendar as CalIcon, X, Loader } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { Task } from '../types';

const TaskList: React.FC = () => {
  const { tasks, selectedDate, addNewTask, toggleTask, removeTask, editTask, syncTasksToGoogleCalendar, t, locale } = useAppContext();
  const [newTaskInput, setNewTaskInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // State for confirmation modal
  const [taskToConfirm, setTaskToConfirm] = useState<Task | null>(null);

  const MAX_TASKS = 5;
  const isToday = isSameDay(selectedDate, new Date());
  
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskInput.trim() && tasks.length < MAX_TASKS) {
      await addNewTask(newTaskInput.trim());
      setNewTaskInput('');
    }
  };

  const startEdit = (id: string, currentContent: string) => {
    setEditingId(id);
    setEditInput(currentContent);
  };

  const saveEdit = async (id: string) => {
    if (editInput.trim()) {
      await editTask(id, editInput.trim());
      setEditingId(null);
    }
  };

  // Logic to intercept the toggle action
  const handleToggleRequest = (task: Task) => {
    if (task.isCompleted) {
      // If unchecking (going from Complete -> Incomplete), do it immediately
      toggleTask(task);
    } else {
      // If completing (Incomplete -> Complete), ask for confirmation
      setTaskToConfirm(task);
    }
  };

  const confirmCompletion = async () => {
    if (taskToConfirm) {
      await toggleTask(taskToConfirm);
      setTaskToConfirm(null);
    }
  };

  const handleSync = async () => {
    if (tasks.length === 0) return;
    
    setIsSyncing(true);
    try {
        await syncTasksToGoogleCalendar(tasks, selectedDate);
        alert(t('sync_success').replace('{n}', tasks.length.toString()));
    } catch (error: any) {
        if (error.message === 'guest_mode') {
            alert(t('sync_guest_error'));
        } else if (error.message === 'auth_failed') {
            alert('Authentication failed. Please check if popups are allowed.');
        } else {
            console.error("Sync Error Details:", error);
            // Display specific error message for debugging
            alert(`Sync Failed: ${error.message || 'Unknown error'}. \n\nTip: Check if Google Calendar API is enabled in Google Cloud Console.`);
        }
    } finally {
        setIsSyncing(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 flex flex-col h-full min-h-[500px]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
              {t('tasks_header')} 
              <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                {tasks.length}/{MAX_TASKS}
              </span>
            </h2>
            <p className="text-gray-400 text-sm capitalize">{format(selectedDate, 'EEEE, MMMM do, yyyy', { locale })}</p>
          </div>
          
          {tasks.length > 0 && (
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
              title={t('sync')}
            >
              {isSyncing ? <Loader size={14} className="animate-spin" /> : <CalIcon size={14} />} 
              {isSyncing ? t('syncing') : t('sync')}
            </button>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleAdd} className="mb-6 relative">
          <input
            type="text"
            placeholder={tasks.length >= MAX_TASKS ? t('limit_reached') : t('add_placeholder')}
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            disabled={tasks.length >= MAX_TASKS}
            className={`w-full p-4 pr-12 rounded-xl border-2 transition-all outline-none 
              ${tasks.length >= MAX_TASKS 
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white border-stone-100 focus:border-primary/50 text-dark'}`}
          />
          <button 
            type="submit"
            disabled={!newTaskInput.trim() || tasks.length >= MAX_TASKS}
            className="absolute right-3 top-3.5 p-1 bg-primary text-white rounded-lg disabled:opacity-50 disabled:bg-gray-300 transition-colors"
          >
            <Plus size={20} />
          </button>
        </form>

        {/* Task List */}
        <div className="flex-1 space-y-3 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-xl">
              <p>{t('no_tasks')}</p>
              <p className="text-xs mt-1">{t('no_tasks_sub')}</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div 
                key={task.id}
                className={`group flex items-center p-3 rounded-xl transition-all duration-300 border
                  ${task.isCompleted 
                    ? 'bg-secondary/10 border-transparent' 
                    : 'bg-white border-stone-100 hover:shadow-md hover:border-primary/20'}`}
              >
                <button 
                  onClick={() => handleToggleRequest(task)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors mr-3
                    ${task.isCompleted 
                      ? 'bg-secondary border-secondary text-white' 
                      : 'border-gray-300 text-transparent hover:border-primary'}`}
                >
                  <Check size={14} strokeWidth={3} />
                </button>

                <div className="flex-1 min-w-0">
                  {editingId === task.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        className="w-full bg-white border border-primary/30 rounded px-2 py-1 text-sm outline-none"
                        autoFocus
                      />
                      <button onClick={() => saveEdit(task.id)} className="text-green-600"><Check size={16}/></button>
                      <button onClick={() => setEditingId(null)} className="text-red-500"><X size={16}/></button>
                    </div>
                  ) : (
                    <span className={`block truncate ${task.isCompleted ? 'text-gray-400 line-through decoration-secondary' : 'text-dark'}`}>
                      {task.content}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  {!task.isCompleted && editingId !== task.id && (
                    <button onClick={() => startEdit(task.id, task.content)} className="text-gray-400 hover:text-blue-500">
                      <Edit2 size={16} />
                    </button>
                  )}
                  <button onClick={() => removeTask(task.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 text-center text-xs text-gray-400 font-light">
          {t('ivy_lee_tip')}
        </div>
      </div>

      {/* Confirmation Modal */}
      {taskToConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/20 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200 border border-secondary/20">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4 text-secondary">
                <Check size={24} />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">{t('modal_title')}</h3>
              <p className="text-gray-500 mb-6 text-sm">
                {t('modal_desc')} "<span className="font-medium text-dark">{taskToConfirm.content}</span>"?
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setTaskToConfirm(null)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors text-sm font-medium"
                >
                  {t('modal_keep')}
                </button>
                <button
                  onClick={confirmCompletion}
                  className="flex-1 py-2.5 px-4 bg-secondary hover:bg-opacity-90 text-white rounded-xl transition-colors shadow-sm text-sm font-medium"
                >
                  {t('modal_confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskList;