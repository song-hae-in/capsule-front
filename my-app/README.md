# Capsule Front

Capsule 웹 앱 (React + TypeScript + Vite).

## 실행

```bash
npm install
npm run dev
```

| 스크립트 | 설명 |
|----------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입체크 + 프로덕션 빌드 |
| `npm run lint` | Oxlint |
| `npm run preview` | 빌드 결과 미리보기 |

## 프로젝트 구조

```
my-app/
├── src/
│   ├── main.tsx              # AppProviders → RouterProvider
│   ├── router.tsx            # AppLayout + appRouteChildren
│   ├── config/wagmi.ts       # chain, connector
│   ├── components/ui/        # 공통 UI (Alert 등)
│   ├── hooks/                # useWallet, useAlert
│   ├── providers/            # Wagmi, Wallet, Alert
│   ├── routes/               # route-config — route + nav 단일 설정
│   └── types/
└── features/
    ├── layout/               # AppLayout shell
    ├── navigation/           # AppNav, wallet UI
    └── landing/              # 랜딩 3D hero
```

## 아키텍처 요약

- **Route + Nav** — `src/routes/route-config.tsx` 한 곳만 수정
- **지갑** — wagmi → `WalletProvider` → `useWallet()` (UI는 navigation feature)
- **알림** — `AlertProvider` → `useAlert()` (토스트) / `Alert` 컴포넌트 (인라인)
- **서버 auth** — 아직 미연결 (지갑 연결 ≠ 백엔드 로그인)

## 폴더별 README

| 경로 | 내용 |
|------|------|
| [src/providers/README.md](src/providers/README.md) | Provider 순서, 지갑, 알림 |
| [src/routes/README.md](src/routes/README.md) | route-config, nav 연동 |
| [features/layout/README.md](features/layout/README.md) | AppLayout shell |
| [features/navigation/README.md](features/navigation/README.md) | nav, wallet UI |
| [features/landing/README.md](features/landing/README.md) | 3D hero, assets |

## 주요 의존성

- React 19, React Router 7, Tailwind CSS 4
- wagmi + viem (Sepolia, MetaMask injected)
- @tanstack/react-query
- three, @react-three/fiber, @react-three/drei
- @radix-ui/react-dropdown-menu, lucide-react

## TODO (앱 전역)

- [ ] 서버 SIWE auth (`AuthProvider`)
- [ ] `/capsules` 등 추가 페이지
- [ ] 모바일 nav 드로어
- [ ] landing CTA 라우팅
