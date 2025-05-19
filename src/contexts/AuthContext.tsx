
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthState, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  auth: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone: string) => Promise<void>;
  logout: () => void;
  clearCache: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const navigate = useNavigate();

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuth({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("user");
        setAuth({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      setAuth({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Get users from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        console.error("Login error:", error);
        toast("Erro ao fazer login", {
          description: "E-mail não encontrado.",
        });
        return;
      }

      // In a real app, you'd verify the password hash here
      // For demo, we'll just check if the passwords match
      if (data.password !== password) {
        toast("Erro ao fazer login", {
          description: "Senha incorreta.",
        });
        return;
      }
      
      // Create user object from Supabase data
      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        // Use phone from DB or empty string if not available - Note: this assumes phone exists in table
        phone: data.phone || ''
      };
      
      localStorage.setItem("user", JSON.stringify(user));
      setAuth({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast("Login realizado com sucesso!", {
        description: `Bem-vindo(a) de volta, ${user.name}!`,
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast("Erro ao fazer login", {
        description: "Houve um problema ao tentar fazer login.",
      });
    }
  };

  const register = async (email: string, password: string, name: string, phone: string) => {
    try {
      // Generate a unique ID for the user
      const id = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      
      // Create session ID
      const sessionTimestamp = Date.now();
      const instance = `session-${sessionTimestamp}`;
      
      // Prepare data for N8N webhook
      const webhookData = {
        id,
        created_at: timestamp,
        name,
        email,
        password,
        instance
      };
      
      // Call the N8N webhook to create user
      const response = await fetch("https://editor.mavicmkt.com.br/webhook-test/5c3cdd33-7a18-4b6a-b3ed-0b4e5a273c18", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(webhookData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to register user with N8N");
      }
      
      // Create a new user object
      const newUser: User = {
        id,
        email,
        phone,
        name,
      };
      
      // Log the user in
      localStorage.setItem("user", JSON.stringify(newUser));
      setAuth({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast("Registro realizado com sucesso!", {
        description: `Bem-vindo(a) ao WhatsReMKT, ${name}!`,
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast("Erro ao registrar", {
        description: "Houve um problema ao tentar criar sua conta.",
      });
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setAuth({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast("Logout realizado com sucesso!", {
      description: "Você foi desconectado(a) da sua conta.",
    });
    navigate("/login");
  };

  // Clear application cache
  const clearCache = () => {
    // Clear all localStorage items
    localStorage.clear();
    
    // Reset auth state
    setAuth({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    
    toast("Cache limpo com sucesso!", {
      description: "Todos os dados locais foram removidos.",
    });
    
    // Redirect to login
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ auth, login, register, logout, clearCache }}>
      {children}
    </AuthContext.Provider>
  );
};
