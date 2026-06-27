# Layout

앱 공통 shell feature. navigation·footer 등을 **조합**만 담당.

```
features/layout/
└── components/
    └── app-layout.tsx    # AppNav + <Outlet />
```

---

## 라우팅 연결

```
src/router.tsx
  └─ AppLayout          ← layout
       ├─ AppNav        ← navigation (import)
       └─ <Outlet />    ← landing 등 페이지
```

| 파일 | 역할 |
|------|------|
| `src/routes/route-config.tsx` | route + nav 설정 |
| `src/router.tsx` | `AppLayout` + `appRouteChildren` |
| `features/navigation/` | nav UI (`AppNav` 등) |

**새 shell 요소 추가** (footer, sidebar) → `app-layout.tsx`에서 import·배치

---

## 수정할 때

| 목적 | 위치 |
|------|------|
| footer / sidebar | `app-layout.tsx` |
| nav 링크·wallet 버튼 UI | `features/navigation/` |
| 페이지 추가 | `src/routes/route-config.tsx` |
