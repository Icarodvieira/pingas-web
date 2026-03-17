# pingrank-web

Front-end do PingRank — Next.js 14 + App Router + Tailwind CSS.

Migrado do Figma Make (Vite + React) para Next.js com design system completo, light/dark mode e estrutura pronta para integração com a API.

## Stack

- **Next.js 14** — App Router
- **React 18**
- **Tailwind CSS 3** — design tokens via CSS variables
- **React Query (TanStack)** — cache e estado do servidor
- **Axios** — HTTP client com interceptors JWT
- **Recharts** — gráfico de evolução ELO
- **lucide-react** — ícones

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

## Estrutura

```
src/
├── app/
│   ├── auth/login/         # Tela de login e cadastro
│   ├── dashboard/          # Lista de grupos do usuário
│   ├── groups/[id]/        # Ranking do grupo
│   ├── groups/[id]/match/  # Registrar partida
│   ├── profile/            # Perfil e estatísticas do usuário
│   ├── layout.tsx          # Layout raiz com providers
│   └── providers.tsx       # React Query + tema
├── components/
│   ├── shared/             # Badge, Button, Input, ThemeToggle, FAB, BottomNav
│   ├── groups/             # GroupCard, RankingRow
│   └── matches/            # MatchCard, PlayerCard
├── lib/
│   ├── api.ts              # Instância Axios com interceptors
│   ├── elo.ts              # Cálculo de ELO (preview no front)
│   └── utils.ts            # cn(), getInitials(), formatEloChange()
└── styles/
    └── globals.css          # Design tokens light/dark + Tailwind
```

## Integrar com a API

Cada tela tem comentários `// TODO:` marcando onde substituir os mocks por chamadas reais.

Exemplo em `app/dashboard/page.tsx`:
```tsx
// Antes (mock):
const mockGroups = [...]

// Depois (API real):
const { data: groups } = useQuery({
  queryKey: ['my-groups'],
  queryFn: () => api.get('/players/me/groups').then(r => r.data),
})
```

## Variável de ambiente

Crie um `.env.local` na raiz:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```
