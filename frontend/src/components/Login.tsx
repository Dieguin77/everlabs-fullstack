import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store/store';
import './Login.css';

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isWakingServer } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🚀 Task Manager</h1>
          <p>Sistema de Gestão de Tarefas - Kanban</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
              <button type="button" onClick={() => dispatch(clearError())}>×</button>
            </div>
          )}

          {isWakingServer && (
            <div className="waking-message" role="status" aria-live="polite">
              ⏳ O servidor gratuito está acordando; pode levar até 1 minuto. Estamos tentando de novo
              automaticamente, não precisa recarregar a página.
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (isWakingServer ? 'Aguardando o servidor...' : 'Entrando...') : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <p>Batgo - Desenvolvido por <a href="https://diegodev.dev.br" target="_blank" rel="noopener noreferrer">Diego Batista</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
