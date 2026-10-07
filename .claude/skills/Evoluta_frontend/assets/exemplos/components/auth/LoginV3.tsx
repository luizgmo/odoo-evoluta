// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual. Atenção: usa localStorage/sessionStorage SEM try/catch (a base e components/ protegem todos os usos); envolva-os ao copiar.
/**
 * LICITARS 3.0 - Premium Login with Navy/Silver Theme
 * Features: Glassmorphism, smooth animations, responsive design
 */

import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, User, AlertCircle } from "lucide-react";
import { CAMPO_DE_ENTRADA, MolduraDeEntrada } from "./MolduraDeEntrada";
import { Carimbo } from "@/components/mesa/Mesa";

const LoginV3: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Só em desenvolvimento e só se o .env local (fora do git) definir: poupa digitar nos testes.
  const [username, setUsername] = useState(
    import.meta.env.DEV ? (import.meta.env.VITE_LOGIN_TESTE_USUARIO ?? "") : ""
  );
  const [password, setPassword] = useState(
    import.meta.env.DEV ? (import.meta.env.VITE_LOGIN_TESTE_SENHA ?? "") : ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // BUG-012: só usa returnUrl se vier do state (quando ProtectedRoute redirecionou).
  // Ignorar localStorage.returnUrl — persistia URL antiga (ex.: /chat8/<sessão>)
  // e causava redirect confuso em logins novos.
  const from = location.state?.from?.pathname || "/dashboard";

  // UX-36: se usuário já está autenticado e acessa /login manualmente,
  // renderizava tela em branco (retornava null mais abaixo). Agora redireciona
  // pro destino preferido — dashboard ou o returnUrl do state.
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(username, password);
      // Clear return URL after successful login
      localStorage.removeItem("returnUrl");
      // Redirect to previous page or dashboard
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || "Credenciais inválidas. Certifique-se de que seu usuário e senha estão corretos.");
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(e.target.value);
      if (error) setError(""); // Clear error on input change
    },
    [error]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      if (error) setError(""); // Clear error on input change
    },
    [error]
  );

  // Don't render if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <MolduraDeEntrada
      rotulo="Acesso do servidor"
      titulo="Entrar"
      subtitulo="Use o usuário e a senha que o seu órgão cadastrou."
      carimbo={
        <Carimbo tinta="azul" grande bateAoAbrir="entrada" className="carimbo-datado">
          <span className="carimbo-datado-miolo">
            <span>Uso restrito</span>
            <span className="carimbo-datado-rodape">servidores autorizados</span>
          </span>
        </Carimbo>
      }
    >
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 animate-fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground">
                Usuário
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={handleUsernameChange}
                  disabled={loading}
                  required
                  className={CAMPO_DE_ENTRADA}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                  className={CAMPO_DE_ENTRADA}
                  autoComplete="current-password"
                />
              </div>
            </div>
            {/* Submit Button */}
            <Button type="submit" disabled={loading} className="h-11 w-full text-base font-semibold">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando…
                </>
              ) : (
                "Entrar"
              )}
            </Button>
            {/* Link de recuperação de senha. */}
            <div className="text-center">
              <Link
                to="/reset-password"
                className="text-sm font-medium text-primary hover:underline dark:text-accent"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </form>
          {/* Additional Info */}
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-center text-sm text-muted-foreground">
              Primeiro acesso? Peça o convite ao administrador do Licitars no seu órgão.
            </p>
            <p className="text-center text-xs text-muted-foreground">
              Ao entrar, você concorda com nossos{" "}
              <span className="font-medium text-foreground">Termos de Uso</span>{" "}
              e{" "}
              <span className="font-medium text-foreground">Política de Privacidade</span>
            </p>
          </div>
    </MolduraDeEntrada>
  );
};

export default LoginV3;
