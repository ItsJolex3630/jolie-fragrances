"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Mail, Lock, User, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (user: AuthUser) => void;
}

export default function AuthModal({ isOpen, onClose, onAuth }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const resetForm = () => {
    setLoginEmail("");
    setLoginPassword("");
    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Campos requeridos",
        description: "Por favor ingresa tu email y contraseña",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Error al iniciar sesión",
          description: data.error || "Credenciales inválidas",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "¡Bienvenido!",
        description: `Hola, ${data.user?.name || data.user?.email}`,
      });

      onAuth(data.user);
      resetForm();
    } catch {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEmail || !registerPassword) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    if (registerPassword.length < 8) {
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          name: registerName || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Error al registrarse",
          description: data.error || "No se pudo crear la cuenta",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "¡Registro exitoso!",
        description: `Bienvenido, ${data.user?.name || data.user?.email}`,
      });

      onAuth(data.user);
      resetForm();
    } catch {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-[#111111] border-[rgba(212,175,55,0.2)] text-white sm:max-w-md p-0 max-h-[90vh] overflow-hidden flex flex-col"
        showCloseButton
      >
        {/* Header with gold gradient */}
        <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#111111] px-6 pt-6 pb-2">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
          <DialogHeader>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#d4af37]" />
            </div>
            <DialogTitle className="text-center font-[family-name:var(--font-playfair)] text-2xl">
              <span className="shimmer-text">Jolie</span>{" "}
              <span className="text-white/80">Fragrances</span>
            </DialogTitle>
            <DialogDescription className="text-center text-white/40 font-[family-name:var(--font-inter)] text-xs">
              Accede a tu cuenta para guardar tus fragancias favoritas
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "login" | "register")}
            className="w-full"
          >
            <TabsList className="w-full bg-[#0a0a0a] border border-[rgba(212,175,55,0.1)] rounded-lg h-10 p-[3px]">
              <TabsTrigger
                value="login"
                className="flex-1 rounded-md text-xs font-[family-name:var(--font-inter)] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4af37] data-[state=active]:to-[#b8941e] data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-sm text-white/50"
              >
                Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="flex-1 rounded-md text-xs font-[family-name:var(--font-inter)] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4af37] data-[state=active]:to-[#b8941e] data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-sm text-white/50"
              >
                Registrarse
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="login" className="mt-4">
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs font-[family-name:var(--font-inter)]">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/50" />
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 bg-[#0a0a0a] border-[rgba(212,175,55,0.15)] text-white placeholder:text-[#555] focus:border-[#d4af37]/40 focus:ring-[#d4af37]/20 h-10 text-sm font-[family-name:var(--font-inter)]"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs font-[family-name:var(--font-inter)]">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/50" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 bg-[#0a0a0a] border-[rgba(212,175,55,0.15)] text-white placeholder:text-[#555] focus:border-[#d4af37]/40 focus:ring-[#d4af37]/20 h-10 text-sm font-[family-name:var(--font-inter)]"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#d4af37] to-[#b8941e] text-[#0a0a0a] font-semibold h-10 font-[family-name:var(--font-inter)] hover:from-[#e5c249] hover:to-[#c9a22e] shadow-lg shadow-[#d4af37]/20"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </motion.form>
              </TabsContent>

              <TabsContent value="register" className="mt-4">
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegister}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs font-[family-name:var(--font-inter)]">
                      Nombre (opcional)
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/50" />
                      <Input
                        type="text"
                        placeholder="Tu nombre"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="pl-10 bg-[#0a0a0a] border-[rgba(212,175,55,0.15)] text-white placeholder:text-[#555] focus:border-[#d4af37]/40 focus:ring-[#d4af37]/20 h-10 text-sm font-[family-name:var(--font-inter)]"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs font-[family-name:var(--font-inter)]">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/50" />
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="pl-10 bg-[#0a0a0a] border-[rgba(212,175,55,0.15)] text-white placeholder:text-[#555] focus:border-[#d4af37]/40 focus:ring-[#d4af37]/20 h-10 text-sm font-[family-name:var(--font-inter)]"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs font-[family-name:var(--font-inter)]">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/50" />
                      <Input
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="pl-10 bg-[#0a0a0a] border-[rgba(212,175,55,0.15)] text-white placeholder:text-[#555] focus:border-[#d4af37]/40 focus:ring-[#d4af37]/20 h-10 text-sm font-[family-name:var(--font-inter)]"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#d4af37] to-[#b8941e] text-[#0a0a0a] font-semibold h-10 font-[family-name:var(--font-inter)] hover:from-[#e5c249] hover:to-[#c9a22e] shadow-lg shadow-[#d4af37]/20"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Crear Cuenta"
                    )}
                  </Button>
                </motion.form>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          {/* Footer text */}
          <p className="text-center text-[10px] text-white/20 mt-4 font-[family-name:var(--font-inter)]">
            Al continuar, aceptas nuestros términos de servicio
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
