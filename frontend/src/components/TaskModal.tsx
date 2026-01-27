import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Task, commentsApi, Comment } from '../services/api';
import './TaskModal.css';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onDelete: (taskId: number) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onDelete }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  const canDelete = user?.role === 'ADMIN';
  const canComment = user?.role === 'ADMIN' || task.assigneeId === user?.id;

  useEffect(() => {
    loadComments();
  }, [task.id]);

  const loadComments = async () => {
    try {
      const response = await commentsApi.listByTask(task.id);
      setComments(response.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await commentsApi.create(task.id, newComment);
      setNewComment('');
      loadComments();
    } catch (error) {
      alert('Erro ao adicionar comentário');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm('Excluir este comentário?')) {
      try {
        await commentsApi.delete(commentId);
        loadComments();
      } catch (error) {
        alert('Erro ao excluir comentário');
      }
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusLabels: Record<string, string> = {
    TODO: '📋 A Fazer',
    IN_PROGRESS: '🔄 Em Progresso',
    REVIEW: '👀 Em Revisão',
    DONE: '✅ Concluído',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task.name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="task-info-grid">
            <div className="info-item">
              <label>Status</label>
              <span className={`status-badge status-${task.status.toLowerCase()}`}>
                {statusLabels[task.status]}
              </span>
            </div>
            
            <div className="info-item">
              <label>Prioridade</label>
              <span className="priority-value">{task.priority}/10</span>
            </div>

            <div className="info-item">
              <label>Responsável</label>
              <span>{task.assignee?.name || 'Não atribuído'}</span>
            </div>

            <div className="info-item">
              <label>Criado em</label>
              <span>{formatDate(task.createdAt)}</span>
            </div>

            {task.startDate && (
              <div className="info-item">
                <label>Data Início</label>
                <span>{formatDate(task.startDate)}</span>
              </div>
            )}

            {task.endDate && (
              <div className="info-item">
                <label>Data Fim</label>
                <span>{formatDate(task.endDate)}</span>
              </div>
            )}
          </div>

          {task.description && (
            <div className="task-description-section">
              <h3>📝 Descrição</h3>
              <p>{task.description}</p>
            </div>
          )}

          <div className="comments-section">
            <h3>💬 Comentários/Ocorrências</h3>
            
            {canComment && (
              <form onSubmit={handleAddComment} className="comment-form">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicionar comentário..."
                  rows={3}
                />
                <button type="submit" disabled={!newComment.trim()}>
                  Enviar
                </button>
              </form>
            )}

            <div className="comments-list">
              {isLoadingComments ? (
                <p className="loading-text">Carregando comentários...</p>
              ) : comments.length === 0 ? (
                <p className="no-comments">Nenhum comentário ainda</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">
                        👤 {comment.user?.name || 'Usuário'}
                      </span>
                      <span className="comment-date">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                    {(user?.role === 'ADMIN' || comment.userId === user?.id) && (
                      <button
                        className="delete-comment"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {canDelete && (
          <div className="modal-footer">
            <button 
              className="delete-task-button"
              onClick={() => onDelete(task.id)}
            >
              🗑️ Excluir Tarefa
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskModal;
