import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthState, User } from "@/types";
import { supabase } from "@/integrations/supabase/client-browser";
import bcrypt from 'bcryptjs';
import { apiService } from "@/services/apiService";
import { notify } from '@/services/notification';
import { useWhatsApp } from "@/contexts/WhatsAppContext";

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

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Limpar o estado quando o componente for desmontado
      setAuth({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    };
  }, []);

  // Validate stored session
  const validateSession = async (storedUser: User) => {
    try {
      // Primeiro verificar se o usuário está autenticado no Supabase Auth
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Sessão do Auth expirada');
      }

      // Depois verificar os dados na tabela users
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, instance')
        .eq('id', storedUser.id)
        .single();

      if (error || !user) {
        throw new Error('Dados do usuário não encontrados');
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
      // 1. Login no Supabase Auth
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Auth data:', authData);
      if (signInError) throw signInError;

      // 2. Verificar se o email foi confirmado
      if (!authData.user?.email_confirmed_at) {
        notify.error('Email não confirmado', {
          description: 'Por favor, confirme seu email antes de fazer login.'
        });
        return;
      }

      // 3. Buscar dados do usuário
      console.log('Buscando usuário com ID:', authData.user.id);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, name, instance')
        .eq('id', authData.user.id)
        .single();

      console.log('User data:', userData);
      console.log('User error:', userError);

      if (userError || !userData) {
        throw new Error('Usuário não encontrado na base de dados');
      }

      // 4. Atualizar o estado com os dados do usuário
      const user = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        instance: userData.instance
      };

      localStorage.setItem('user', JSON.stringify(user));
      setAuth({ user, isAuthenticated: true, isLoading: false });

      notify.success('Login realizado com sucesso', {
        description: 'Bem-vindo de volta!'
      });

      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error logging in:', error);
      notify.error('Erro ao fazer login', {
        description: 'Verifique suas credenciais e tente novamente.'
      });
      setAuth(prev => ({ ...prev, isAuthenticated: false, isLoading: false }));
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      // 1. Registrar no Supabase Auth com confirmação de email
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      console.log('Auth signup data:', data);
      if (error) throw error;
      if (!data.user) throw new Error('Falha ao criar usuário');

      // 2. Criar instance no Evolution API
      notify.loading('Criando sua instância do WhatsApp...', {
        duration: 3000
      });

      const instanceName = `instance_${data.user.id}`;
      const evolutionInstance = await apiService.createInstance(instanceName);

      console.log('Evolution instance:', evolutionInstance);
      if (!evolutionInstance) {
        throw new Error('Falha ao criar instância no Evolution API');
      }

      // 3. Inserir dados na tabela users
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Inserindo usuário:', {
        id: data.user.id,
        email: data.user.email,
        name: name,
        instance: instanceName,
        // não logamos a senha por segurança
      });

      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            name: name,
            instance: instanceName,
            password: hashedPassword
          }
        ]);

      console.log('Insert error:', insertError);

      if (insertError) {
        // Se falhar ao criar na tabela users, tentar deletar a instância
        try {
          await apiService.deleteInstance(instanceName);
          await supabase.auth.admin.deleteUser(data.user.id);
        } catch (cleanupError) {
          console.error('Erro ao limpar recursos após falha:', cleanupError);
        }
        throw insertError;
      }

      notify.success('Conta criada com sucesso!', {
        description: 'Verifique seu email para ativar sua conta.'
      });

      // 4. Não fazer login automático, aguardar verificação de email
      setAuth(prev => ({ ...prev, isLoading: false }));
      navigate('/register/check-email');
    } catch (error) {
      console.error('Error registering:', error);
      notify.error('Erro ao criar conta', {
        description: 'Não foi possível criar sua conta. Tente novamente.'
      });
      setAuth(prev => ({ ...prev, isAuthenticated: false, isLoading: false }));
    }
  };

  const logout = async () => {
    try {
      // 1. Primeiro fazer o signOut do Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // 2. Limpar todos os itens do localStorage
      localStorage.clear();

      // 3. Atualizar o estado da autenticação
      setAuth({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      // 4. Mostrar notificação de sucesso
      notify.success('Logout realizado com sucesso', {
        description: 'Até logo!'
      });

      // 5. Forçar um reload completo da página
      window.location.href = '/login';
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
