/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_GROQ_API_KEY?: string;
	readonly VITE_GROQ_MODEL?: string;
	readonly VITE_GROQ_MAX_COMPLETION_TOKENS?: string;
	readonly VITE_GROQ_TEMPERATURE?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}