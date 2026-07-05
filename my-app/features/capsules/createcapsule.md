# Create Capsule

캡슐 생성 플로우 스펙. 진입: `/capsules/create` (`create-capsule-page.tsx`)

지갑 미연결 시 접근 불가 — route는 `RequireWallet`으로 감싸져 있고(`route-config.tsx`),
nav·landing CTA에서는 이동 전에 차단해 현재 페이지 재마운트(랜딩 3D 재로딩)를 방지한다.

---

## 개요

5단계 위저드(`create-capsule-wizard.tsx`, Kokonut `smooth-tab` tabs)로 캡슐을 만든다.
각 스텝은 저장·이전 가능하며, 마지막 **Review & Seal**에서 암호화·IPFS 업로드·온체인 기록을 수행한다.

```
Step 1  Add Memories        → 로컬 버퍼에 파일 보관 (IPFS X)
Step 2  Set Unlock Date     → unlock 날짜·시각 + Confirm (visibility·encryption은 optional, MVP 제외)
Step 3  Choose Design       → 캡슐 외형 선택 (scaffold)
Step 4  Validate            → 사전 검증 체크리스트 (scaffold)
Step 5  Review & Seal       → 암호화 · IPFS · MetaMask · 온체인 Seal
```

**핵심 원칙**

1. **파일 선택 ≠ IPFS 업로드** — Step 1~4는 브라우저 로컬 state만 사용한다.
2. **UI progress ≠ IPFS progress** — Step 1 카드에는 progress bar 없음. IPFS progress는 Seal 단계에서만 표시.
3. **metadataCid와 온체인 상태 분리** — MetaMask 서명 실패 시 `metadataCid` 유지, 온체인 기록만 재시도.
4. **스텝 가드** — `use-create-capsule-wizard`가 스텝별 통과 조건 검증 (Step 1: 파일 ≥ 1 · Step 2: unlock confirm). 미충족 시 Next·탭 이동 차단 + toast.

---

## 상태 모델

### 파일 단위 — `files[].seal`

| 시점 | status | UI |
|------|--------|-----|
| 파일 선택됨 | `ready_to_seal` | Badge: Ready to seal · 삭제 가능 · progress 없음 |
| 유효성 검사 중 | `checking` | Badge: Checking |
| 제한 초과 | `invalid` | Badge: Invalid · 에러 메시지 |
| Seal 클릭 후 암호화 | `encrypting` | Badge: Encrypting · 삭제 불가 |
| 해시 계산 | `hashing` | Badge: Hashing |
| IPFS 전송 중 | `uploading` | Badge: Uploading · **IPFS progress bar** |
| CID 생성 완료 | `ipfs_ready` | Badge: IPFS Ready · CID 표시 |
| 온체인 기록 완료 | `sealed` | Badge: Sealed |
| 실패 | `failed` | Badge: Failed · IPFS 재시도 |

```ts
type MemoryFileStatus =
  | 'ready_to_seal'
  | 'checking'
  | 'invalid'
  | 'encrypting'
  | 'hashing'
  | 'uploading'
  | 'ipfs_ready'
  | 'sealed'
  | 'failed';

type MemoryFile = {
  id: string;
  file: File;
  category: 'photo' | 'document' | 'other';
  previewUrl?: string;
  seal: {
    status: MemoryFileStatus;
    progress: number;   // IPFS upload % only (uploading)
    cid?: string;
    error?: string;
  };
};
```

### 캡슐 버퍼 — `buffer.ipfs` / `buffer.onchain`

Step 5 Seal 시 파일 CID + 메시지 + design + unlock rule → **metadata JSON** → IPFS pin.

```ts
type CapsuleBuffer = {
  ipfs: {
    status: 'idle' | 'uploading' | 'ready' | 'failed';
    metadataCid?: string;   // ★ 온체인 실패해도 유지
    error?: string;
  };
  onchain: {
    status: 'idle' | 'awaiting_signature' | 'submitting' | 'failed' | 'confirmed';
    txHash?: string;
    error?: string;
  };
};
```

---

## Step 1 UX — Add Memories

### 사용자 흐름

```
파일 선택 / 드롭
    ↓
로컬 preview 생성 (Object URL)
    ↓
용량·타입 검증 (실패 시 toast, 파일 미추가)
    ↓
stacked memory card 표시
    ↓
status: ready_to_seal (progress bar 없음)
    ↓
삭제 가능
    ↓
(IPFS 업로드 없음 — Step 2~3도 로컬 버퍼 유지)
```

### UI 컴포넌트

| 영역 | 컴포넌트 | Step 1 동작 |
|------|----------|-------------|
| Dropzone | `Card` + hidden `input` | 드래그앤드롭 · multiple |
| 파일 카드 | `Attachment` | 썸네일/아이콘 · 파일명 · 크기 |
| 상태 | `Badge` | `Ready to seal` |
| 진행률 | — | **표시 안 함** |
| 삭제 | `AttachmentAction` + `Tooltip` | 항상 가능 |
| 알림 | Sonner | 추가/검증 실패 토스트 |

---

## Step 2 UX — Set Unlock Date

`set-unlock-date-step.tsx` + `lib/unlock-date.ts`

- **프리셋 칩** — `1 week / 1 month / 6 months / 1 year / 5 years / 10 years` 클릭 시 해당 날짜로 점프 (캘린더 뷰도 해당 월로 이동)
- **캘린더** — shadcn `Calendar`, `captionLayout="dropdown"` (연도 범위: 오늘 ~ +10년, `MAX_YEARS_AHEAD`) · 과거 날짜 disabled
- **슬라이더** — days from today (0~365) · hour (0~23) · minute (15분 step)
- **Confirm** — 날짜·시각 확인 후 `unlockConfirmed: true` 설정. 날짜·시각을 다시 바꾸면 자동 해제되고 Step 3+ 접근이 다시 잠김
- visibility · encryption · wallet allowlist · secret code는 optional — MVP 미구현

---

## Step 5 UX — Review & Seal

### Seal 클릭 시

```
1. encrypting  (파일별 또는 번들)
2. hashing
3. uploading   → IPFS progress bar 표시
4. ipfs_ready  → file CID + metadataCid pin
5. MetaMask 서명 요청
6. 온체인 기록 → sealed / buffer.onchain.confirmed
```

### 서명 실패 시

- `metadataCid` / file CID **유지**
- `buffer.onchain.status = failed`
- **Retry blockchain record** 버튼만 표시 (IPFS 재업로드 X)

---

## 실패 복구

| 조건 | 동작 |
|------|------|
| `buffer.ipfs.ready` + `buffer.onchain.failed` | 온체인만 재시도 |
| `buffer.ipfs.failed` | metadata pin 재시도 |
| `files[].seal.failed` | 해당 파일 IPFS 재업로드 |

---

## 구현 현황

### Step 1
- [x] Dropzone + `memory-file-upload` (로컬 버퍼)
- [x] stacked memory card (`Attachment` + `Badge`)
- [x] `ready_to_seal` 상태 · progress bar 제거
- [x] 삭제 · scroll-fade (4개 이상)
- [ ] 메시지 · 링크 입력

### Seal 파이프라인
- [x] `uploadAllToIpfs` / `uploadFileToIpfs` hook (mock, Seal 단계용)
- [x] `CapsuleBuffer` 타입 (`create-capsule.ts`)
- [x] Review & Seal UI + mock MetaMask/onchain
- [x] Retry blockchain record / metadata pin

### 위저드
- [x] 5스텝 위저드 (`create-capsule-wizard` + Kokonut `smooth-tab` tabs)
- [x] `use-create-capsule` + `use-create-capsule-wizard` (스텝 가드 + toast)
- [x] Step 1 Add Memories · Step 5 Review & Seal
- [x] Step 2 Set Unlock Date (캘린더 dropdown + 프리셋 칩 + 슬라이더 + Confirm)
- [ ] Step 3 Choose Design · Step 4 Validate (scaffold)

### 접근 가드
- [x] `RequireWallet` — 지갑 미연결 시 `/capsules/create` 접근 차단 (`/`로 redirect + toast)
- [x] nav(`nav-action-search`)·landing CTA — 미연결 시 이동 자체를 차단 (랜딩 3D 재마운트 방지)

---

## 파일 구조

```
features/capsules/
├── createcapsule.md
├── pages/
│   ├── create-capsule-page.tsx
│   └── list-capsule-page.tsx
├── components/
│   ├── create-capsule-wizard.tsx    # smooth-tab 위저드 orchestrator
│   ├── require-wallet.tsx           # route 가드
│   ├── memory-file-upload.tsx       # Step 1
│   ├── memory-card.tsx
│   ├── memory-dropzone.tsx
│   └── steps/
│       ├── wizard-step-shell.tsx    # 공통 shell + scaffold 카드
│       ├── add-memories-step.tsx    # Step 1
│       ├── set-unlock-date-step.tsx # Step 2
│       ├── choose-design-step.tsx   # Step 3 (scaffold)
│       ├── validate-step.tsx        # Step 4 (scaffold)
│       └── review-seal-step.tsx     # Step 5
├── constants/wizard-steps.ts        # 스텝 정의·순서
├── hooks/
│   ├── use-memory-files.ts          # 로컬 버퍼 + Seal 시 IPFS API
│   ├── use-create-capsule.ts        # buffer·design·unlock + seal 파이프라인
│   └── use-create-capsule-wizard.ts # 스텝 이동·가드
├── lib/
│   ├── mock-ipfs-upload.ts
│   ├── mock-seal-pipeline.ts        # metadata pin · 서명 · 온체인 mock
│   └── unlock-date.ts               # 날짜 헬퍼 (프리셋·포맷)
└── types/
    ├── memory-upload.ts
    └── create-capsule.ts            # CapsuleBuffer · UnlockRule · Design
```
