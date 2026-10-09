/**
 * Tela de entrada (Workspace Evoluta): painel azul + folha marfim com o formulário.
 * Em outro sistema, mantenha useAuth().login(usuario, senha) e o destino pós-login.
 */

import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, User, AlertCircle } from "lucide-react";
import { CAMPO_DE_ENTRADA, MolduraDeEntrada } from "./MolduraDeEntrada";
import { Carimbo } from "@/components/mesa/Mesa";
import { MARCA } from "@/config/marca";

const Login: React.FC = () => {
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

  // Volta para a tela que pediu o login (vem do state, posto pela ProtectedRoute); sem ela, a tela inicial.
  const from = location.state?.from?.pathname || MARCA.rotaInicial;

  // Quem já está autenticado e abre /login à mão vai direto para o destino, não vê tela em branco.
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
      rotulo={MARCA.entrada.rotulo}
      titulo="Entrar"
      subtitulo={MARCA.entrada.subtitulo}
      carimbo={
        <Carimbo tinta="azul" grande bateAoAbrir="entrada" className="carimbo-datado">
          <span className="carimbo-datado-miolo">
            <span>{MARCA.entrada.carimbo}</span>
            <span className="carimbo-datado-rodape">{MARCA.entrada.carimboRodape}</span>
          </span>
        </Carimbo>
      }
    >
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 animate-fade-in">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
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
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Entrando…
                </>
              ) : (
                "Entrar"
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              O acesso e as permissões são definidos pela conta da prefeitura no Odoo.
            </p>

          </form>
          {/* Additional Info */}
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-center text-sm text-muted-foreground">
              Primeiro acesso? Fale com {MARCA.quemConvida} para receber o convite.
            </p>
            {/* Só aparece se MARCA.links tiver endereço: sem link, a frase prometeria um documento que ninguém abre */}
            {(MARCA.links.termos || MARCA.links.privacidade) && (
              <p className="text-center text-xs text-muted-foreground">
                Ao entrar, você concorda com{" "}
                {MARCA.links.termos && (
                  <a href={MARCA.links.termos} className="font-medium text-foreground underline">
                    os Termos de Uso
                  </a>
                )}
                {MARCA.links.termos && MARCA.links.privacidade && " e "}
                {MARCA.links.privacidade && (
                  <a href={MARCA.links.privacidade} className="font-medium text-foreground underline">
                    a Política de Privacidade
                  </a>
                )}
              </p>
            )}
          </div>
    </MolduraDeEntrada>
  );
};

export default Login;
