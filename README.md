# Polyglot AI

Aplicativo web de prática de idiomas em tempo real com voz, transcrição ao vivo e respostas faladas via Google Gemini Live.

## Características

- Tradução em tempo real entre idiomas.
- Treino de pronúncia com interação por voz.
- Conversação livre com a IA no idioma alvo.
- Entrada e saída de áudio em streaming.
- Transcrição incremental em tempo real (mensagens "ao vivo").
- Interface moderna com React + Tailwind CSS.

## Tecnologias

- React 18
- TypeScript
- Vite 5
- Tailwind CSS
- Web Audio API
- Google Gen AI SDK oficial (`@google/genai`)
- Gemini Live API (`ai.live.connect`)
- Modelo de áudio em tempo real: `gemini-2.5-flash-native-audio-preview-09-2025`

## Pré-requisitos

- Node.js 18+
- npm
- Chave de API do Google AI Studio: https://aistudio.google.com/app/apikey

## Instalação e execução

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo `.env.local` na raiz do projeto:

```env
VITE_API_KEY=sua_chave_api_aqui
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

4. Acesse: `http://localhost:5173`

## Modos de uso

- Tradução em Tempo Real: traduz sua fala para o idioma alvo.
- Treino de Pronúncia: prática guiada de pronúncia com áudio.
- Conversação Livre: diálogo natural com a IA no idioma selecionado.

## Estrutura do projeto

```text
src/
	components/
		ChatTranscription.tsx
		ControlButton.tsx
		MicrophonePermission.tsx
		SettingsPanel.tsx
	hooks/
		useGeminiLive.ts
	services/
		audioService.ts
		geminiLiveService.ts
		translationService.ts
```

## Build de produção

```bash
npm run build
```

Saída em `dist/`.

## Variáveis de ambiente

- Obrigatória: `VITE_API_KEY`
- O arquivo recomendado para desenvolvimento local é `.env.local`

Exemplo:

```env
VITE_API_KEY=sua_chave_api_aqui
VITE_API_BASE_URL=https://generativelanguage.googleapis.com
VITE_DEBUG=false
```

## Segurança

- Não commitar `.env.local`.
- Não expor a chave de API no frontend em ambientes públicos sem proteção adicional.
- Para produção, prefira um backend/proxy para proteger credenciais e aplicar controle de uso.

## Troubleshooting

### Erro: `VITE_API_KEY não encontrada`

- Verifique se `.env.local` existe na raiz.
- Reinicie o Vite após alterar variáveis de ambiente.

### Microfone não ativa

- Garanta a permissão de microfone no navegador.
- Teste em HTTPS ou localhost.

### Sem áudio de resposta da IA

- Verifique volume/saída de áudio.
- Recarregue a página e inicie nova sessão.

## Licença

MIT
