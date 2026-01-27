import React from 'react';
import { Task } from '../services/api';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent) => void;
  onClick: () => void;
}

const priorityColors: Record<number, string> = {
  0: '#94a3b8',
  1: '#94a3b8',
  2: '#94a3b8',
  3: '#22c55e',
  4: '#22c55e',
  5: '#eab308',
  6: '#eab308',
  7: '#f97316',
  8: '#f97316',
  9: '#ef4444',
  10: '#ef4444',
};

const getPriorityLabel = (priority: number): string => {
  if (priority <= 2) return 'Baixa';
  if (priority <= 4) return 'Normal';
  if (priority <= 6) return 'Média';
  if (priority <= 8) return 'Alta';
  return 'Urgente';
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onClick }) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const isOverdue = () => {
    if (!task.endDate || task.status === 'DONE') return false;
    return new Date(task.endDate) < new Date();
  };

  return (
    <div
      className={`task-card ${isOverdue() ? 'overdue' : ''}`}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
    >
      <div className="task-header">
        <h4 className="task-name">{task.name}</h4>
        <span 
          className="task-priority"
          style={{ backgroundColor: priorityColors[task.priority] }}
        >
          {getPriorityLabel(task.priority)}
        </span>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        {task.assignee && (
          <span className="task-assignee">
            👤 {task.assignee.name}
          </span>
        )}
        
        {task.endDate && (
          <span className={`task-due-date ${isOverdue() ? 'overdue' : ''}`}>
            📅 {formatDate(task.endDate)}
          </span>
        )}
      </div>

      {task._count && (
        <div className="task-counters">
          {task._count.comments > 0 && (
            <span className="counter">💬 {task._count.comments}</span>
          )}
          {task._count.files > 0 && (
            <span className="counter">📎 {task._count.files}</span>
          )}
          {task._count.tags > 0 && (
            <span className="counter">🏷️ {task._count.tags}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
