import { test, expect } from "@playwright/test";

const login = process.env.E2E_LOGIN;
const password = process.env.E2E_PASSWORD;

test.describe("Evoluta Gestão — sessão real", () => {
  test("login válido carrega perfil, dashboard e projetos pelo Odoo", async ({ page }) => {
    test.skip(!login || !password, "Defina E2E_LOGIN e E2E_PASSWORD para executar contra o Odoo real.");
    await page.goto("/login");
    await page.getByLabel("Usuário").fill(login!);
    await page.getByLabel("Senha").fill(password!);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("Minha Mesa").first()).toBeVisible();

    const perfil = await page.request.get("/api/me");
    expect(perfil.ok()).toBeTruthy();
    const perfilJson = await perfil.json();
    expect(perfilJson.record?.role).toBeTruthy();
    expect(perfilJson.record?.permissions).toBeTruthy();

    await page.goto("/projetos");
    await expect(page.getByRole("heading", { name: "Projetos" })).toBeVisible();
    const projetos = await page.request.get("/api/projetos");
    expect(projetos.ok()).toBeTruthy();
    const projetosJson = await projetos.json();
    expect(Array.isArray(projetosJson.records)).toBeTruthy();
  });

  test("login inválido não cria sessão", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Usuário").fill("e2e-usuario-inexistente");
    await page.getByLabel("Senha").fill("senha-invalida-que-nao-deve-funcionar");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText(/incorret|sessão|não foi possível/i)).toBeVisible();
  });

  test("rota protegida sem sessão volta ao login e não exibe recuperação fictícia", async ({ page }) => {
    await page.goto("/projetos");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
    await expect(page.getByText("Esqueceu sua senha?")).toHaveCount(0);
  });

  test("tela de entrada funciona em 400px sem rolagem horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto("/login");

    await expect(page.getByLabel("Usuário")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();
    const dimensoes = await page.evaluate(() => ({
      viewport: window.innerWidth,
      documento: document.documentElement.scrollWidth,
      corpo: document.body.scrollWidth,
      excedentes: Array.from(document.querySelectorAll("*"))
        .map((elemento) => ({ tag: elemento.tagName, classe: elemento.className, direita: Math.ceil(elemento.getBoundingClientRect().right), esquerda: Math.floor(elemento.getBoundingClientRect().left) }))
        .filter(({ direita, esquerda }) => direita > window.innerWidth || esquerda < 0)
        .slice(0, 5),
    }));
    expect(dimensoes.documento, JSON.stringify(dimensoes)).toBeLessThanOrEqual(dimensoes.viewport);
  });
});
