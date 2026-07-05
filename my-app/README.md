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
│   ├── components/ui/        # 공통 UI (shadcn — Alert, Calendar, Slider 등)
│   ├── hooks/                # useWallet, useAlert
│   ├── providers/            # Wagmi, Wallet, Alert
│   ├── routes/               # route-config — route + nav 단일 설정
│   └── types/
└── features/
    ├── layout/               # AppLayout shell
    ├── navigation/           # AppNav, wallet UI
    ├── landing/              # 랜딩 3D hero
    └── capsules/             # 캡슐 생성 5스텝 위저드 + 목록
```

## 아키텍처 요약

- **Route + Nav** — `src/routes/route-config.tsx` 한 곳만 수정
- **지갑** — wagmi → `WalletProvider` → `useWallet()` (UI는 navigation feature)
- **지갑 가드** — `/capsules/create`는 `RequireWallet` + nav/landing에서 이동 전 차단
- **알림** — `AlertProvider` → `useAlert()` (토스트) / `Alert` 컴포넌트 (인라인)
- **캡슐 생성** — 5스텝 위저드, 파일은 로컬 버퍼 → Seal 시에만 IPFS·온체인 (mock)
- **서버 auth** — 아직 미연결 (지갑 연결 ≠ 백엔드 로그인)

## 폴더별 README

| 경로 | 내용 |
|------|------|
| [src/providers/README.md](src/providers/README.md) | Provider 순서, 지갑, 알림 |
| [src/routes/README.md](src/routes/README.md) | route-config, nav 연동 |
| [features/layout/README.md](features/layout/README.md) | AppLayout shell |
| [features/navigation/README.md](features/navigation/README.md) | nav, wallet UI |
| [features/landing/README.md](features/landing/README.md) | 3D hero, assets |
| [features/capsules/createcapsule.md](features/capsules/createcapsule.md) | 캡슐 생성 위저드 스펙·구현 현황 |

## 주요 의존성

- React 19, React Router 7, Tailwind CSS 4
- wagmi + viem (Sepolia, MetaMask injected)
- @tanstack/react-query
- three, @react-three/fiber, @react-three/drei
- @radix-ui/react-dropdown-menu, lucide-react

## TODO (앱 전역)

- [ ] 서버 SIWE auth (`AuthProvider`)
- [x] landing CTA 라우팅 (지갑 가드 포함)
- [ ] `/capsules` 목록 페이지 실제 데이터 연동
- [ ] 캡슐 위저드 Step 3 (Choose Design) · Step 4 (Validate) 구현
- [ ] 실제 IPFS·온체인 연동 (현재 mock)
- [ ] 모바일 nav 드로어
