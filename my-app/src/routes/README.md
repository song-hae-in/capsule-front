# Routes

앱 route + nav **단일 설정**. `router.tsx`와 nav 링크가 여기서 파생.

```
src/routes/
├── types.ts           # AppRouteConfig, NavItem
├── route-config.tsx   # APP_ROUTES — 여기만 수정
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

---

## TODO

- [ ] lazy `React.lazy` + Suspense
- [ ] auth `requiredAuth` → nav/route 가드
- [ ] nested routes (layout per section)
