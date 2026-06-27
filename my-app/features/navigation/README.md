# Navigation

Capsule 상단 navigation UI feature. route 설정은 `src/routes/` — nav는 `getNavItems()` 소비.

```
features/navigation/
├── components/
│   ├── app-nav.tsx
│   ├── nav-action-search.tsx   # ActionSearchBar + HoverCard
│   ├── nav-links.tsx           # (legacy) 단순 링크 — 미사용
│   ├── wallet-connect-button.tsx
│   └── wallet-profile-menu.tsx
└── utils/
    └── wallet-display.ts       # 아바타 URL, 주소 포맷, explorer, 상태 라벨
```

---

## 라우팅 연결

```
src/routes/route-config.tsx (APP_ROUTES)
       ├─→ router.tsx (appRouteChildren)
       └─→ nav-action-search.tsx (getNavItems → ActionSearchBar)

AppLayout (layout) → AppNav (navigation) → Outlet → pages
```

| 파일 | 역할 |
|------|------|
| `src/routes/route-config.tsx` | route + nav **단일 설정** |
| `src/router.tsx` | `appRouteChildren` 사용 |
| `features/layout/` | shell |
| `features/navigation/` | nav UI |

**새 페이지** → `src/routes/route-config.tsx`에만 추가

---

## 지갑 — 역할 분리

| 레이어 | 위치 |
|--------|------|
| wagmi config | `src/config/wagmi.ts` |
| Provider | `src/providers/wallet-provider.tsx` |
| Hook | `src/hooks/use-wallet.ts` |
| 표시 유틸 | `utils/wallet-display.ts` |
| UI | `wallet-connect-button.tsx`, `wallet-profile-menu.tsx` |
| 연결 실패 알림 | `useAlert()` (`src/hooks/use-alert.ts`) |

---

## components/

### `app-nav.tsx`

- 로고 + `NavLinks` + `WalletConnectButton`
- `fixed h-14`, backdrop blur
- TODO: 모바일 햄버거 + 드로어

### `nav-action-search.tsx`

- `@kokonutui/action-search-bar` compact 모드
- nav 항목: **Create**, **List** (`route-config` `showInNav`)
- 드롭다운 항목 hover → `HoverCard`로 `navInfo` 표시
- 선택 시 `react-router` navigate

### `nav-links.tsx`

- (legacy) 단순 Link 목록 — `nav-action-search`로 대체됨

### `wallet-connect-button.tsx`

- 미연결: `Connect Wallet` 버튼 (`h-9`)
- 연결됨: `WalletProfileMenu`로 위임
- 연결 실패 시 `useAlert()` destructive 토스트

### `wallet-profile-menu.tsx`

- 연결됨: `h-9` pill — 원형 아바타 + 체인 상태(초록 점 + chainName)
- Radix 드롭다운: 주소 복사, explorer, disconnect

---

## utils/

### `wallet-display.ts`

- `getWalletAvatarUrl(address)` — picsum 시드 기반 샘플 아바타
- `formatWalletAddress(address)` — `0x1234…abcd`
- `getWalletStatusLabel(status, chainName)` — nav 상태 텍스트
- `getExplorerUrl(address)` — Sepolia etherscan (TODO: chainId 분기)

---

## 수정할 때

| 목적 | 위치 |
|------|------|
| route·nav 추가 | `src/routes/route-config.tsx` |
| nav UI | `app-nav.tsx`, `nav-links.tsx` |
| wallet 로직 | `src/providers/wallet-provider.tsx` |
| wallet 표시 | `utils/wallet-display.ts` |
| shell | `features/layout/components/app-layout.tsx` |

---

## TODO

- [ ] 모바일 햄버거 + 드로어
- [x] wallet web3 연동 (wagmi + MetaMask)
- [ ] nav auth 필터 (`route-config` metadata 활용)
- [ ] chainId별 explorer URL
