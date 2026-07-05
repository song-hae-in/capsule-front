# Landing

Capsule 랜딩 화면 feature.

```
features/landing/
├── pages/
│   └── landing-page.tsx      # 라우터 진입점
├── components/
│   └── landing-hero.tsx      # 랜딩 UI (3D + 카피 + 버튼)
└── assets/
    ├── landing-texture.png   # 컬러 텍스처
    └── landing-depth.png     # 뎁스맵
```

---

## 라우팅 연결

```
src/router.tsx  →  AppLayout (layout)  →  pages/landing-page.tsx  →  LandingHero
                      ↑
                   AppNav (navigation)
```

| 파일 | 역할 |
|------|------|
| `src/routes/route-config.tsx` | route + nav 단일 설정 |
| `src/router.tsx` | `AppLayout` + `appRouteChildren` |
| `features/layout/` | 공통 shell (`AppNav` + `<Outlet />`) |
| `features/navigation/` | 상단 nav UI |
| `src/providers/` | 지갑 등 전역 상태 — `main.tsx`에서 마운트 |
| `pages/landing-page.tsx` | `LandingHero` 렌더 |

**Start Your Capsule** — 지갑 연결됨: `/capsules/create`로 이동 · 미연결: toast 후 `connect()` 성공 시 이동.
미연결 상태에서 라우트 이동을 먼저 하지 않는 이유: `RequireWallet`이 되돌리면 랜딩이 재마운트되어 3D가 재로딩되기 때문.

---

## pages/

### `landing-page.tsx`

- 라우터가 불러오는 진입점 (`LandingPage`)
- 현재는 `LandingHero`만 렌더
- 페이지 단위 데이터·SEO·레이아웃이 필요해지면 여기서 처리

---

## components/

### `landing-hero.tsx`

- 3D 뎁스 씬 (React Three Fiber)
- 제목·부제 (이미지 중앙 오버레이)
- CTA 버튼 (하단) — `useWallet` + `useNavigate`로 Create 이동 (위 참고)
- 텍스처는 `THREE.NoColorSpace` 강제 — 라우트 이동 후 재방문 시 어두워지는 현상 방지

**주요 props**

| prop | 설명 | 기본값 |
|------|------|--------|
| `title` / `subtitle` | 카피 | Capsule 기본 문구 |
| `textureSrc` / `depthSrc` | 컬러·뎁스맵 | `assets/landing-*.png` |
| `scaleFactor` | 3D 오브젝트 크기 | `0.32` |
| `className` | 섹션 추가 클래스 | `''` |

**수정할 때**

| 목적 | 위치 |
|------|------|
| 이미지 교체 | `assets/landing-texture.png`, `assets/landing-depth.png` (Vite import — `public/` 아님) |
| 카피·버튼 문구 | `landing-hero.tsx` JSX |
| 오브젝트 크기 | `scaleFactor` prop |
| 버튼 라우팅 | `landing-hero.tsx` `handleStartCapsule` (지갑 가드 포함) |

**폰트** — `index.html` / `src/index.css`  
- 제목: Syne (`font-display`)  
- 본문: Instrument Sans (`font-sans`)

---

## 의존성

- `three`, `@react-three/fiber`, `@react-three/drei`
