import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	// As classes de mesa ficam em @layer components (index.css) e o Tailwind remove as que nenhum arquivo
	// de src cita. Copiou um trecho de HTML (references/09 §13) sem usar a classe em .tsx? Ela precisa estar aqui.
	safelist: [
		// Nomes explícitos, não regex: o safelist por padrão só casa com utilitários do Tailwind, não com classes
			// próprias de @layer components, e avisaria "doesn't match any Tailwind CSS classes" a cada build.
			"mesa", "mesa-apoio", "mesa-faixa", "mesa-faixa-apoio", "mesa-linha", "mesa-rotulo", "mesa-secao", "mesa-titulo", "mesa-un",
			"pasta-capa", "pasta-corpo", "pasta-gaveta", "pasta-lombada", "pasta-orelha",
			"carimbo", "carimbo-bate", "carimbo-datado", "carimbo-datado-data", "carimbo-datado-miolo", "carimbo-datado-rodape", "carimbo-grande",
			"folha", "folha-furada", "folha-simples",
			"tinta-azul", "tinta-carmim", "tinta-grafite", "tinta-ocre", "tinta-verde", "tinta-violeta",
			"borda-tinta-carmim", "borda-tinta-ocre",
			"livro-aberto", "livro-pagina", "livro-pagina-esq",
			"cal-marca", "cal-marca-quadro",
			"bloco-espiral", "bloco-notas", "bloco-notas-titulo",
		"bilhete",
		"ficha",
		"folhinha",
		"gaveta",
		"espiral",
		"clipe-de-papel",
		"etiqueta-pasta",
		"linha-de-caderno",
		"margem-registro",
		"pilha-folha",
		"tampo-vista",
		"documento-oficial",
		"texto-do-documento",
		"eyebrow",
		"sem-quebra",
		"quebra-pagina",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				// Evoluta design system — cada família presa a um papel
				sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
				display: ['"Cormorant Garamond"', 'ui-serif', 'Georgia', 'Cambria', 'serif'],
				serif: ['"Cormorant Garamond"', 'ui-serif', 'Georgia', 'Cambria', 'serif'],
				ui: ['"Barlow Semi Condensed"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Ouro (Evoluta) — só fill/ícone; ver guardas de contraste
				gold: 'hsl(var(--gold) / <alpha-value>)',
				// Moldura Workspace: faixa do alto (azul do fundo do logo Evoluta) e barra de abas
				moldura: {
					DEFAULT: 'hsl(var(--moldura) / <alpha-value>)',
					2: 'hsl(var(--moldura-2) / <alpha-value>)',
					foreground: 'hsl(var(--moldura-foreground) / <alpha-value>)',
				},
				// Navy/Platinum/Steel (escalas legadas; o visual novo usa os tokens semânticos) — steps usados são var-backed (flipam por tema).
				// navy = superfície/borda; platinum/steel = texto (ver index.css).
				navy: {
					'50': '#e8eaf0',
					'100': '#d1d5e1',
					'200': '#a3abc3',
					'300': '#7581a5',
					'400': '#475787',
					'500': 'hsl(var(--navy-500) / <alpha-value>)', // Border accent
					'600': 'hsl(var(--navy-600) / <alpha-value>)', // Cards
					'700': 'hsl(var(--navy-700) / <alpha-value>)', // Sidebar
					'800': 'hsl(var(--navy-800) / <alpha-value>)', // Main background
					'900': 'hsl(var(--navy-900) / <alpha-value>)',
					'950': '#020304',
				},
				platinum: {
					'50': 'hsl(var(--platinum-50) / <alpha-value>)',
					'100': 'hsl(var(--platinum-100) / <alpha-value>)',
					'200': 'hsl(var(--platinum-200) / <alpha-value>)',
					'300': 'hsl(var(--platinum-300) / <alpha-value>)', // Accent platinum
					'400': 'hsl(var(--platinum-400) / <alpha-value>)', // Silver metallic
					'500': 'hsl(var(--platinum-500) / <alpha-value>)',
					'600': '#7d7d7d',
					'700': '#5a5a5a',
					'800': '#3d3d3d',
					'900': '#1f1f1f',
				},
				steel: {
					'50': '#f0f4f8',
					'100': '#dce4ec',
					'200': '#b9c9d9',
					'300': 'hsl(var(--steel-300) / <alpha-value>)',
					'400': 'hsl(var(--steel-400) / <alpha-value>)',
					'500': 'hsl(var(--steel-500) / <alpha-value>)', // Steel blue
					'600': '#4a5568',
					'700': '#384152',
					'800': '#262d3b',
					'900': '#141924',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(10px)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.7'
					}
				},
				'slide-in': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'slide-in': 'slide-in 0.3s ease-out'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
