# Routes

앱 route + nav **단일 설정**. `router.tsx`와 nav 링크가 여기서 파생.

```
src/routes/
├── types.ts           # AppRouteConfig, NavItem
├── route-config.tsx   # APP_ROUTES — 여기만 수정 · CREATE_CAPSULE_PATH export
└── index.ts           # export
```

---

## 사용 흐름

```
route-config.tsx (APP_ROUTES)
       ├─→ appRouteChildren  →  src/router.tsx
       └─→ getNavItems()     →  nav-links.tsx
```

---

## 새 페이지 추가

`route-config.tsx`에 항목 하나 추가:

```tsx
{
  path: '/capsules',
  label: 'My Capsules',
  element: <CapsulesPage />,
  showInNav: true,
},
```

`router.tsx`·`nav-links.tsx` 별도 수정 **불필요**.

---

## AppRouteConfig

| 필드 | 설명 |
|------|------|
| `path` | react-router path (외부 URL도 가능) |
| `label` | nav 라벨 |
| `element` | 페이지 컴포넌트 (external nav-only면 생략) |
| `showInNav` | nav 표시 (기본 true) |
| `external` | true → router 제외, nav는 `<a>` |
| `description` | nav 드롭다운 보조 텍스트 |
| `navInfo` | nav hover 카드 설명 |

---

## 지갑 가드

`/capsules/create`는 `RequireWallet`(`features/capsules/components/require-wallet.tsx`)으로 감싸져 있다.

```tsx
element: (
  <RequireWallet>
    <CreateCapsulePage />
  </RequireWallet>
),
```

- 미연결 시 `/`로 redirect + toast (`id: 'require-wallet'` — StrictMode 중복 방지)
- nav·landing CTA는 이동 전에 자체적으로 차단 (재마운트 방지) — `RequireWallet`은 URL 직접 진입용 안전장치

---

## TODO

- [ ] lazy `React.lazy` + Suspense
- [x] wallet 가드 (`RequireWallet` — create route)
- [ ] auth `requiredAuth` metadata로 가드 일반화
- [ ] nested routes (layout per section)
