
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
      // In a real app, this would be an API call
      // For now, we'll simulate a login
      if (email && password) {
        // Check localStorage for existing user with this email
        const storedUsers = localStorage.getItem("users");
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        const user = users.find((u: User) => u.email === email);
        
        if (!user) {
          toast("Erro ao fazer login", {
            description: "E-mail não encontrado.",
          });
          return;
        }

        // In a real app, you'd verify the password here
        // For demo purposes, we're skipping password verification
        
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
      }
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
      
      // Create a new user object
      const newUser: User = {
        id,
        email,
        phone,
        name,
      };
      
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
      const response = await fetch("https://n8n.mavicmkt.com.br/webhook/5c3cdd33-7a18-4b6a-b3ed-0b4e5a273c18", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(webhookData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to register user with N8N");
      }
      
      // Also store in Supabase
      const { error } = await supabase.from('users').insert([{
        id,
        name,
        email,
        password,
        instance,
        created_at: timestamp
      }]);
      
      if (error) {
        console.error("Supabase insert error:", error);
        throw new Error("Failed to register user with Supabase");
      }
      
      // Save locally too for the app to work
      const storedUsers = localStorage.getItem("users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      
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

  return (
    <AuthContext.Provider value={{ auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
