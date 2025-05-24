import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthState, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import bcrypt from 'bcryptjs';
import { apiService } from "@/services/apiService";
import { notify } from '@/services/notification';

interface AuthContextType {
  auth: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const navigate = useNavigate();

  // Validate stored session
  const validateSession = async (storedUser: User) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, instance')
        .eq('id', storedUser.id)
        .single();

      if (error || !user) {
        throw new Error('Sessão inválida');
      }

      // Verificar se os dados armazenados correspondem aos do banco
      if (user.email !== storedUser.email || user.name !== storedUser.name) {
        throw new Error('Dados de sessão inconsistentes');
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const currentPath = window.location.pathname;
        
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const isValid = await validateSession(user);

          if (isValid) {
            setAuth({
              user: {
                id: user.id,
                email: user.email || '',
                name: user.name || '',
                instance: user.instance || ''
              },
              isAuthenticated: true,
              isLoading: false,
            });
            
            // Redirecionar para o dashboard se estiver em uma rota pública
            if (currentPath === '/' || currentPath === '/login' || currentPath === '/register') {
              navigate('/dashboard');
            }
          } else {
            // Se a sessão for inválida, limpar tudo
            localStorage.removeItem("user");
            localStorage.removeItem("whatsapp_session");
            localStorage.removeItem("whatsapp_contacts");
            localStorage.removeItem("whatsapp_instance");
            setAuth({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            navigate('/login');
          }
        } else {
          setAuth({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (e) {
        console.error("Failed to initialize auth:", e);
        localStorage.removeItem("user");
        setAuth({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        navigate('/login');
      }
    };

    initializeAuth();
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      setAuth({
        user: {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || '',
          instance: data.user.user_metadata?.instance || ''
        },
        isAuthenticated: true,
        isLoading: false
      });

      notify.success('Login realizado com sucesso', {
        description: 'Bem-vindo de volta!'
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in:', error);
      notify.error('Erro ao fazer login', {
        description: 'Verifique suas credenciais e tente novamente.'
      });
      setAuth(prev => ({ ...prev, error: error as Error }));
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) throw error;

      setAuth({
        user: {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || '',
          instance: data.user.user_metadata?.instance || ''
        },
        isAuthenticated: true,
        isLoading: false
      });

      notify.success('Registro realizado com sucesso', {
        description: 'Sua conta foi criada! Bem-vindo!'
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error registering:', error);
      notify.error('Erro ao criar conta', {
        description: 'Não foi possível criar sua conta. Tente novamente.'
      });
      setAuth(prev => ({ ...prev, error: error as Error }));
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setAuth({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      notify.success('Logout realizado com sucesso', {
        description: 'Até logo!'
      });

      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      notify.error('Erro ao fazer logout', {
        description: 'Não foi possível finalizar sua sessão.'
      });
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
