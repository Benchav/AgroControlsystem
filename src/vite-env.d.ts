/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_GROQ_API_KEY?: string;
	readonly VITE_GROQ_API_KEY_1?: string;
	readonly VITE_GROQ_API_KEY_2?: string;
	readonly VITE_GROQ_API_KEY_3?: string;
	readonly VITE_GROQ_API_KEY_4?: string;
	readonly VITE_GROQ_API_KEY_5?: string;
	readonly VITE_GROQ_MODEL?: string;
	readonly VITE_GROQ_MAX_COMPLETION_TOKENS?: string;
	readonly VITE_GROQ_TEMPERATURE?: string;
	readonly VITE_GEMINI_API_KEY_1?: string;
	readonly VITE_GEMINI_API_KEY_2?: string;
	readonly VITE_GEMINI_API_KEY_3?: string;
	readonly VITE_GEMINI_API_KEY_4?: string;
	readonly VITE_GEMINI_API_KEY_5?: string;
	readonly VITE_GEMINI_MODEL?: string;
	readonly VITE_API_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}