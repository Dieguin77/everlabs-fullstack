import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchTasks, updateTaskStatus, moveTask, deleteTask } from '../store/slices/tasksSlice';
import { Task, TaskStatus } from '../services/api';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import CreateTaskModal from './CreateTaskModal';
import './KanbanBoard.css';

const COLUMNS: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'TODO', title: '📋 A Fazer', color: '#e2e8f0' },
  { status: 'IN_PROGRESS', title: '🔄 Em Progresso', color: '#fef3c7' },
  { status: 'REVIEW', title: '👀 Em Revisão', color: '#ddd6fe' },
  { status: 'DONE', title: '✅ Concluído', color: '#d1fae5' },
];

const KanbanBoard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, isLoading, error } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.status !== newStatus) {
      // Check permission: user can only update their own tasks
      if (user?.role !== 'ADMIN' && draggedTask.assigneeId !== user?.id) {
        alert('Você só pode mover suas próprias tarefas!');
        setDraggedTask(null);
        return;
      }

      // Optimistic update
      dispatch(moveTask({ taskId: draggedTask.id, newStatus }));
      
      // API call
      try {
        await dispatch(updateTaskStatus({ id: draggedTask.id, status: newStatus })).unwrap();
      } catch (error) {
        // Revert on error
        dispatch(fetchTasks());
        alert('Erro ao mover tarefa');
      }
    }
    
    setDraggedTask(null);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await dispatch(deleteTask(taskId)).unwrap();
        setSelectedTask(null);
      } catch (error) {
        alert('Erro ao excluir tarefa');
      }
    }
  };

  if (isLoading && tasks.length === 0) {
    return <div className="loading">Carregando tarefas...</div>;
  }

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <h2>Quadro de Tarefas</h2>
        {user?.role === 'ADMIN' && (
          <button 
            className="create-task-button"
            onClick={() => setShowCreateModal(true)}
          >
            + Nova Tarefa
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="kanban-board">
        {COLUMNS.map(column => (
          <div 
            key={column.status} 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <div 
              className="column-header"
              style={{ backgroundColor: column.color }}
            >
              <h3>{column.title}</h3>
              <span className="task-count">
                {getTasksByStatus(column.status).length}
              </span>
            </div>
            
            <div className="column-content">
              {getTasksByStatus(column.status).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => handleTaskClick(task)}
                />
              ))}
              
              {getTasksByStatus(column.status).length === 0 && (
                <div className="empty-column">
                  Arraste tarefas para cá
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)}
          onDelete={handleDeleteTask}
        />
      )}

      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default KanbanBoard;
