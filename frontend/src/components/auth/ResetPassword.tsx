/**
 * Recuperação de senha, na mesma moldura da tela de entrada (MolduraDeEntrada).
 *
 * Modos:
 * - Sem `?token=`: form de e-mail → POST em `/auth/password-reset/request/` do cliente HTTP
 *   (o servidor responde sempre 200; a tela mostra mensagem neutra, sem revelar se o e-mail existe)
 * - Com `?token=<uuid>`: form de nova senha → POST em `/auth/password-reset/confirm/`
 *   (sucesso → volta ao login; falha → mostra o código do erro)
 * Troque os dois endereços pelos do seu servidor.
 */

import React, { useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CAMPO_DE_ENTRADA, MolduraDeEntrada } from "./MolduraDeEntrada";
import { Loader2, Lock, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiPost, CLIENTE_DE_DEMONSTRACAO } from "@/services/api/client";

const fieldClass = CAMPO_DE_ENTRADA;
const submitClass = "h-11 w-full text-base font-semibold";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      if (CLIENTE_DE_DEMONSTRACAO) {
        setInfo("Demonstração: nenhum e-mail é enviado. Em um ambiente real, esta ação enviaria o link de recuperação.");
        setEmail("");
        return;
      }
      await apiPost("/auth/password-reset/request/", { email });
      // Backend é anti-enumeration — sempre retorna 200. Mostramos mensagem neutra.
      setInfo(
        "Se o email estiver cadastrado, enviaremos um link para redefinir a senha. Verifique a caixa de entrada e o spam."
      );
      setEmail("");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Não foi possível processar a solicitação. Tente novamente em alguns minutos."
      );
    } finally {
      setLoading(false);
    }
  };

  // Validação de força mínima da senha no navegador; alinhe às regras do seu servidor.
  const validatePasswordStrength = (pw: string): string | null => {
    if (pw.length < 8) return "Senha deve ter pelo menos 8 caracteres.";
    if (!/\d/.test(pw)) return "Senha deve conter pelo menos um número.";
    if (!/[a-zA-Z]/.test(pw)) return "Senha deve conter pelo menos uma letra.";
    if (/^\d+$/.test(pw)) return "Senha não pode ser apenas números.";
    return null;
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    if (password !== passwordConfirm) {
      setError("As senhas não conferem.");
      setLoading(false);
      return;
    }
    const strengthError = validatePasswordStrength(password);
    if (strengthError) {
      setError(strengthError);
      setLoading(false);
      return;
    }
    try {
      if (CLIENTE_DE_DEMONSTRACAO) {
        setInfo("Demonstração: a senha não é alterada e nenhum acesso é modificado.");
        return;
      }
      await apiPost("/auth/password-reset/confirm/", {
        token,
        password,
        password_confirm: passwordConfirm,
      });
      setInfo("Senha redefinida com sucesso! Redirecionando para o login…");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err: any) {
      const code = err?.response?.data?.code;
      const detail = err?.response?.data?.detail;
      const map: Record<string, string> = {
        invalid_token: "Token inválido. Solicite um novo link.",
        expired_token: "Link expirado. Solicite um novo link.",
        used_token: "Este link já foi utilizado. Solicite um novo.",
        weak_password: detail || "Senha muito fraca. Use no mínimo 8 caracteres.",
        password_mismatch: "As senhas não conferem.",
      };
      setError(map[code] || detail || "Não foi possível redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  const onEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      if (error) setError("");
    },
    [error]
  );

  const onPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      if (error) setError("");
    },
    [error]
  );

  const onPasswordConfirmChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordConfirm(e.target.value);
      if (error) setError("");
    },
    [error]
  );

  return (
    <MolduraDeEntrada
      titulo={token ? "Definir nova senha" : "Recuperar senha"}
      subtitulo={token ? "Escolha uma nova senha forte para sua conta" : "Informe seu email para receber um link de redefinição"}
    >
          {CLIENTE_DE_DEMONSTRACAO && (
            <p role="note" className="rounded-md border border-border px-3 py-2 text-xs text-muted-foreground">
              Demonstração: nenhum e-mail é enviado e a senha não é alterada.
            </p>
          )}
          {error && (
            <Alert
              variant="destructive"
              className="border-destructive/50 bg-destructive/10 animate-fade-in"
            >
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}
          {info && (
            <Alert className="border-[hsl(var(--tinta-verde)/0.5)] bg-[hsl(var(--tinta-verde)/0.1)] animate-fade-in">
              <CheckCircle2 className="h-4 w-4 tinta-verde" aria-hidden="true" />
              <AlertDescription className="tinta-verde">
                {info}
              </AlertDescription>
            </Alert>
          )}

          {token ? (
            <form onSubmit={handleConfirm} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Nova senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={onPasswordChange}
                    disabled={loading}
                    required
                    autoComplete="new-password"
                    autoFocus
                    className={fieldClass}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="passwordConfirm"
                  className="text-sm font-medium text-foreground"
                >
                  Confirmar senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="passwordConfirm"
                    type="password"
                    placeholder="Repita a nova senha"
                    value={passwordConfirm}
                    onChange={onPasswordConfirmChange}
                    disabled={loading}
                    required
                    autoComplete="new-password"
                    className={fieldClass}
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className={submitClass}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                    Redefinindo…
                  </>
                ) : (
                  "Redefinir senha"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRequest} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email cadastrado
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={onEmailChange}
                    disabled={loading}
                    required
                    autoComplete="email"
                    autoFocus
                    className={fieldClass}
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className={submitClass}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                    Enviando…
                  </>
                ) : (
                  "Enviar link de recuperação"
                )}
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-border text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-primary hover:underline dark:text-accent"
            >
              ← Voltar ao login
            </Link>
          </div>
    </MolduraDeEntrada>
  );
};

export default ResetPassword;
