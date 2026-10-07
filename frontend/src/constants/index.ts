/** Versão mostrada no menu da conta (para o suporte). Mantenha igual à "version" do package.json. */
export const APP_VERSION = "0.1.0";

/** SHA curto do commit, injetado pelo vite.config.ts ("dev" fora do git). */
export const APP_GIT_SHA: string = typeof __GIT_SHA__ !== "undefined" ? __GIT_SHA__ : "dev";
