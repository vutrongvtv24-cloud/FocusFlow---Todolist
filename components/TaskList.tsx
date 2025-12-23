import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Check, Trash2, Edit2, Calendar as CalIcon, X, Loader, GripVertical, ChevronDown, ChevronUp, CornerDownRight } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { Task, Subtask } from '../types';

// Dnd Kit Imports
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sub-component for Sortable Subtask Item ---
const SortableSubtaskItem = ({ subtask, index, taskId, styles }: any) => {
    const { toggleSubtask, removeSubtask } = useAppContext();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: subtask.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div 
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-2 p-2 rounded-lg mb-1 group/sub transition-all ${isDragging ? 'bg-white/20' : ''}`}
        >
            {/* Drag Handle for Subtask */}
            <div 
                {...attributes} 
                {...listeners} 
                className={`${styles.iconColor} opacity-40 hover:opacity-100 cursor-grab active:cursor-grabbing`}
                // Important: Stop propagation to prevent dragging the parent task
                onPointerDown={(e) => e.stopPropagation()} 
            >
                <GripVertical size={14} />
            </div>

            <div className={`text-xs font-mono font-bold opacity-60 ${styles.text}`}>
                {index + 1}.
            </div>

            <button 
                onClick={() => toggleSubtask(taskId, subtask.id)}
                className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors
                  ${subtask.isCompleted 
                    ? styles.checkboxChecked
                    : `${styles.checkboxBorder} bg-transparent`}`}
            >
                {subtask.isCompleted && <Check size={10} strokeWidth={4} />}
            </button>
            
            <div className={`flex-1 text-sm ${subtask.isCompleted ? 'line-through opacity-50' : ''} ${styles.text}`}>
                {subtask.content}
            </div>

            <button 
                onClick={() => removeSubtask(taskId, subtask.id)}
                className={`opacity-0 group-hover/sub:opacity-100 p-1 hover:bg-black/10 rounded transition-all ${styles.iconColor}`}
            >
                <Trash2 size={12} />
            </button>
        </div>
    );
};

// --- Sub-component for Sortable Item ---
const SortableTaskItem = ({ 
  task, 
  index, 
  editingId, 
  editInput, 
  setEditInput, 
  startEdit, 
  saveEdit, 
  setEditingId, 
  handleToggleRequest, 
  removeTask 
}: any) => {
  const { t, addSubtask, reorderSubtasks } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [showSubInput, setShowSubInput] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.9 : 1,
  };

  // Hàm xác định bộ màu sắc dựa trên mức độ ưu tiên
  const getTaskStyles = (idx: number, isCompleted: boolean) => {
    // Nếu đã hoàn thành: Màu xám nhạt, chữ chìm
    if (isCompleted) {
      return {
        container: 'bg-stone-100 border-stone-200',
        text: 'text-stone-400',
        contentDecor: 'line-through decoration-stone-400',
        iconColor: 'text-stone-300',
        checkboxBorder: 'border-stone-300',
        checkboxChecked: 'bg-stone-400 border-stone-400 text-white',
        subtaskBg: 'bg-stone-50'
      };
    }

    // Logic màu theo thứ tự ưu tiên
    switch (idx) {
        case 0: // High Priority (Red)
            return {
                container: 'bg-[#D62828] border-[#D62828] shadow-md', // Red background
                text: 'text-white', // High contrast white text
                contentDecor: '',
                iconColor: 'text-white/60 hover:text-white', // Subtle icons
                checkboxBorder: 'border-white/60 hover:border-white', // White border for checkbox
                checkboxChecked: 'bg-white border-white text-[#D62828]', // Inverted when checked
                subtaskBg: 'bg-black/10'
            };
        case 1: // Medium-High (Orange)
            return {
                container: 'bg-[#F77F00] border-[#F77F00] shadow-md',
                text: 'text-white',
                contentDecor: '',
                iconColor: 'text-white/60 hover:text-white',
                checkboxBorder: 'border-white/60 hover:border-white',
                checkboxChecked: 'bg-white border-white text-[#F77F00]',
                subtaskBg: 'bg-black/10'
            };
        case 2: // Medium (Yellow)
            return {
                container: 'bg-[#FCBF49] border-[#FCBF49] shadow-sm',
                text: 'text-[#3D405B]', // Dark text on Yellow
                contentDecor: '',
                iconColor: 'text-[#3D405B]/50 hover:text-[#3D405B]',
                checkboxBorder: 'border-[#3D405B]/30 hover:border-[#3D405B]',
                checkboxChecked: 'bg-[#3D405B] border-[#3D405B] text-[#FCBF49]',
                subtaskBg: 'bg-black/5'
            };
        case 3: // Low-Medium (Green/Sage)
            return {
                container: 'bg-[#81B29A] border-[#81B29A] shadow-sm',
                text: 'text-white',
                contentDecor: '',
                iconColor: 'text-white/60 hover:text-white',
                checkboxBorder: 'border-white/60 hover:border-white',
                checkboxChecked: 'bg-white border-white text-[#81B29A]',
                subtaskBg: 'bg-black/10'
            };
        default: // Low/Default (White)
            return {
                container: 'bg-white border-stone-200 shadow-sm',
                text: 'text-dark',
                contentDecor: '',
                iconColor: 'text-stone-300 hover:text-stone-500',
                checkboxBorder: 'border-gray-300 hover:border-primary',
                checkboxChecked: 'bg-secondary border-secondary text-white',
                subtaskBg: 'bg-gray-50'
            };
    }
  };

  const styles = getTaskStyles(index, task.isCompleted);
  const subtasks = task.subtasks || [];
  const hasSubtasks = subtasks.length > 0;

  const handleSubtaskAdd = async (e: React.FormEvent) => {
      e.preventDefault();
      if(newSubtaskInput.trim()) {
          await addSubtask(task.id, newSubtaskInput.trim());
          setNewSubtaskInput('');
          // Keep input open to add more
      }
  };

  // Local DnD for Subtasks
  const subtaskSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSubtaskDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (active.id !== over?.id && subtasks) {
          const oldIndex = subtasks.findIndex((s: Subtask) => s.id === active.id);
          const newIndex = subtasks.findIndex((s: Subtask) => s.id === over?.id);
          const newSubtasks = arrayMove(subtasks, oldIndex, newIndex);
          reorderSubtasks(task.id, newSubtasks);
      }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`group flex flex-col rounded-xl mb-3 transition-all duration-200 border ${styles.container}`}
    >
      <div className="flex items-center p-3.5">
          {/* Drag Handle */}
          {!task.isCompleted && editingId !== task.id && (
            <div {...attributes} {...listeners} className={`mr-2 cursor-grab active:cursor-grabbing ${styles.iconColor}`}>
              <GripVertical size={18} />
            </div>
          )}

          {/* Checkbox */}
          <button 
            onClick={() => handleToggleRequest(task)}
            className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors mr-3
              ${task.isCompleted 
                ? styles.checkboxChecked
                : `${styles.checkboxBorder} text-transparent`}`}
          >
            <Check size={14} strokeWidth={3} />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {editingId === task.id ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={editInput}
                  onChange={(e) => setEditInput(e.target.value)}
                  className="w-full bg-white text-dark border border-primary/30 rounded px-2 py-1 text-sm outline-none shadow-inner"
                  autoFocus
                  onKeyDown={(e) => {
                    if(e.key === 'Enter') saveEdit(task.id);
                  }}
                />
                <button onClick={() => saveEdit(task.id)} className="bg-white text-green-600 hover:bg-green-50 p-1 rounded shadow-sm"><Check size={16}/></button>
                <button onClick={() => setEditingId(null)} className="bg-white text-red-500 hover:bg-red-50 p-1 rounded shadow-sm"><X size={16}/></button>
              </div>
            ) : (
              <span className={`block truncate font-medium ${styles.text} ${styles.contentDecor}`}>
                {task.content}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-2">
            {!task.isCompleted && (
                <>
                    <button 
                        onClick={() => {
                            if(!isExpanded) setIsExpanded(true);
                            setShowSubInput(!showSubInput);
                        }} 
                        className={`p-1.5 rounded-md transition-colors ${styles.iconColor} hover:bg-black/10`}
                        title={t('add_subtask_placeholder')}
                    >
                        <Plus size={16} />
                    </button>
                    {editingId !== task.id && (
                        <button onClick={() => startEdit(task.id, task.content)} className={`p-1.5 rounded-md transition-colors ${styles.iconColor} hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <Edit2 size={16} />
                        </button>
                    )}
                </>
            )}
            
            {(hasSubtasks || showSubInput) && (
                 <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className={`p-1.5 rounded-md transition-colors ${styles.iconColor} hover:bg-black/10`}
                >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                 </button>
            )}

            <button onClick={() => removeTask(task.id)} className={`p-1.5 rounded-md transition-colors ${styles.iconColor} hover:bg-black/10 hover:text-red-200 opacity-0 group-hover:opacity-100 transition-opacity`}>
              <Trash2 size={16} />
            </button>
          </div>
      </div>

      {/* Subtasks Area */}
      {isExpanded && (
          <div className={`px-4 pb-3 pt-1 ${styles.subtaskBg} rounded-b-xl border-t border-white/10 mx-1 mb-1`}>
              {/* List Subtasks */}
              {hasSubtasks && (
                  <div className="mb-2 pl-2">
                      <DndContext 
                          sensors={subtaskSensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleSubtaskDragEnd}
                      >
                          <SortableContext 
                             items={subtasks.map((s: Subtask) => s.id)}
                             strategy={verticalListSortingStrategy}
                          >
                              {subtasks.map((sub: Subtask, idx: number) => (
                                  <SortableSubtaskItem 
                                      key={sub.id} 
                                      subtask={sub} 
                                      index={idx} 
                                      taskId={task.id} 
                                      styles={styles} 
                                  />
                              ))}
                          </SortableContext>
                      </DndContext>
                  </div>
              )}

              {/* Add Subtask Input */}
              {showSubInput && (
                  <form onSubmit={handleSubtaskAdd} className="flex items-center gap-2 pl-4 mt-2">
                      <CornerDownRight size={14} className={styles.iconColor} />
                      <input
                          type="text"
                          value={newSubtaskInput}
                          onChange={(e) => setNewSubtaskInput(e.target.value)}
                          placeholder={t('add_subtask_placeholder')}
                          className="flex-1 bg-white/20 text-white placeholder-white/50 border border-white/30 rounded px-2 py-1 text-xs outline-none focus:bg-white focus:text-dark focus:placeholder-gray-400 transition-all"
                          autoFocus
                      />
                      <button 
                          type="submit" 
                          disabled={!newSubtaskInput.trim()}
                          className={`p-1 rounded bg-white/20 hover:bg-white/40 text-white disabled:opacity-30`}
                      >
                          <Plus size={14} />
                      </button>
                  </form>
              )}
          </div>
      )}
    </div>
  );
};

// --- Main Component ---
const TaskList: React.FC = () => {
  const { tasks, selectedDate, addNewTask, toggleTask, removeTask, editTask, reorderTasks, syncTasksToGoogleCalendar, t, locale } = useAppContext();
  const [newTaskInput, setNewTaskInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // State for confirmation modal
  const [taskToConfirm, setTaskToConfirm] = useState<Task | null>(null);

  const MAX_TASKS = 5;
  const isToday = isSameDay(selectedDate, new Date());
  
  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Safety check: ensure we are reordering Main Tasks, not Subtasks bubbling up
    // (Though separate DndContexts should prevent this, it's good practice)
    if (!over || active.id === over.id) return;

    // Check if active item is a main task (exists in tasks array)
    const isMainTask = tasks.some(t => t.id === active.id);
    if (!isMainTask) return; 

    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      reorderTasks(newTasks);
    }
  };
  
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
      toggleTask(task);
    } else {
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
            alert(`Sync Failed: ${error.message || 'Unknown error'}.`);
        }
    } finally {
        setIsSyncing(false);
    }
  };

  // Progress Calculation
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 flex flex-col h-full min-h-[500px]">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
              {t('tasks_header')} 
              <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                {tasks.length}/{MAX_TASKS}
              </span>
            </h2>
            <p className="text-gray-400 text-sm capitalize mt-1">{format(selectedDate, 'EEEE, MMMM do, yyyy', { locale })}</p>
          </div>
          
          {tasks.length > 0 && (
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50 mt-1"
              title={t('sync')}
            >
              {isSyncing ? <Loader size={14} className="animate-spin" /> : <CalIcon size={14} />} 
              {isSyncing ? t('syncing') : t('sync')}
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mb-6">
             <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{t('tasks_progress')}</span>
                <span>{progressPercent}%</span>
             </div>
             <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                   className="bg-secondary h-2 rounded-full transition-all duration-500 ease-out" 
                   style={{ width: `${progressPercent}%` }}
                ></div>
             </div>
          </div>
        )}

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

        {/* Sortable Task List */}
        <div className="flex-1 overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-xl">
              <p>{t('no_tasks')}</p>
              <p className="text-xs mt-1">{t('no_tasks_sub')}</p>
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {tasks.map((task, index) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    editingId={editingId}
                    editInput={editInput}
                    setEditInput={setEditInput}
                    startEdit={startEdit}
                    saveEdit={saveEdit}
                    setEditingId={setEditingId}
                    handleToggleRequest={handleToggleRequest}
                    removeTask={removeTask}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-gray-400 font-light border-t border-stone-50 pt-3">
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