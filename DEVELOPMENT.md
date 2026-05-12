# Guia de Desenvolvimento - Polyglot AI

## 📝 Padrões de Código

### TypeScript
- Sempre use tipos explícitos em funções
- Prefira interfaces sobre types quando apropriado
- Use enums para constantes predefinidas

### React
- Componentes funcionais com hooks
- Nomes de componentes em PascalCase
- Props interface nomeada como `{NomeComponente}Props`
- Use `React.FC<Props>` para tipagem

### Styling
- Use apenas classes Tailwind CSS
- Não adicione arquivos CSS separados (exceto index.css global)
- Siga a convenção de espaçamento: `px-4 py-3` etc

## 🔧 Estrutura de Arquivos

```
src/
├── components/          # Componentes reutilizáveis
│   ├── SettingsPanel.tsx
│   ├── ChatTranscription.tsx
│   └── ControlButton.tsx
├── hooks/               # React Hooks customizados
│   └── useGeminiLive.ts
├── services/            # Lógica de negócio
│   ├── geminiLiveService.ts
│   ├── audioService.ts
│   └── translationService.ts
├── utils/               # Funções utilitárias
│   ├── formatting.ts
│   ├── storage.ts
│   └── api.ts
├── App.tsx              # Componente raiz
├── main.tsx             # Entry point
├── index.css            # Estilos globais
└── vite-env.d.ts        # Tipos do Vite
```

## 🚀 Próximas Implementações

### Alto Prioridade
- [ ] Integrar API Gemini Live real (WebSocket)
- [ ] Implementar streaming de áudio bidirecional
- [ ] Adicionar reconhecimento de voz com transcrição
- [ ] Implementar reprodução de áudio em tempo real

### Médio Prioridade
- [ ] Adicionar histórico de conversas salvo
- [ ] Implementar análise de pronúncia
- [ ] Adicionar tema escuro/claro
- [ ] Criar dashboard de progresso
- [ ] Adicionar testes unitários

### Baixo Prioridade
- [ ] Adicionar analytics
- [ ] Implementar PWA
- [ ] Criar versão mobile nativa
- [ ] Adicionar gamificação

## 🧪 Testes

```bash
# Adicionar biblioteca de testes
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Executar testes
npm run test
```

## 📦 Build e Deploy

```bash
# Build para produção
npm run build

# Visualizar build localmente
npm run preview

# Deploy no Vercel/Netlify
# Simplesmente conecte o repositório
```

## 🐛 Debug

### Console do Navegador
- Abra DevTools (F12)
- Vá para a aba Console
- Veja logs de erro e informações

### Breakpoints
- Na aba Sources do DevTools
- Clique no número da linha para adicionar breakpoint
- O código pausará quando a linha for executada

### React DevTools
- Instale extensão React DevTools
- Inspecione componentes e estado

## 🔐 Variáveis de Ambiente

Crie `.env.local`:
```env
VITE_GEMINI_API_KEY=sua_chave
VITE_DEBUG=true
```

## 🎯 Checklist de Desenvolvimento

### Antes de Commitar
- [ ] Código segue padrões de formatação
- [ ] Sem erros no console
- [ ] Sem warnings do TypeScript
- [ ] Componentes testados manualmente
- [ ] Mensagens de commit claras

### Antes de Deploy
- [ ] `npm run build` sem erros
- [ ] Testar no navegador de produção
- [ ] Verificar responsive design
- [ ] Testar com conexão lenta
- [ ] Verificar acessibilidade

## 📚 Recursos Úteis

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)
- [Google Gemini API](https://ai.google.dev)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 💡 Dicas de Performance

1. Use `React.memo` para componentes que não mudam
2. Use `useCallback` para evitar re-renders desnecessários
3. Implemente code splitting com `React.lazy`
4. Otimize imagens e assets
5. Use ferramentas como Lighthouse para análise

## 🤝 Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
2. Commit suas mudanças: `git commit -m 'Adicionar minha feature'`
3. Push para a branch: `git push origin feature/minha-feature`
4. Abra um Pull Request

## 📞 Suporte

Para dúvidas sobre desenvolvimento, consulte:
- Documentação do projeto (README.md)
- Comentários no código
- Issues no repositório
