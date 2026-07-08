# TimeCapsule Smart Contract

## 설정

### 환경변수

`.env` 파일을 생성하고 다음 값을 설정하세요:

```bash
cp .env.example .env
```

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_wallet_private_key_here
```

## 컴파일

```bash
npm run compile
```

## 테스트

```bash
npm test
```

## ABI 추출

컴파일 후 ABI를 프론트엔드 `src/shared/config/abi.ts`로 추출합니다:

```bash
# 컴파일 + ABI 추출 한 번에
npm run build

# 또는 개별 실행
npm run compile
npm run copy-abi
```

`copy-abi` 명령은 `artifacts/contracts/TimeCapsule.sol/TimeCapsule.json`에서 ABI를 추출하여 `../src/shared/config/abi.ts`에 TypeScript 파일로 저장합니다. 컨트랙트를 먼저 컴파일해야 artifact가 생성됩니다.

## 배포

### 로컬 배포 (Hardhat Network)

```bash
# 별도 터미널에서 로컬 노드 실행
npx hardhat node

# 로컬 네트워크에 배포
npm run deploy:local
```

### Sepolia 테스트넷 배포

1. `.env`에 `SEPOLIA_RPC_URL`과 `PRIVATE_KEY`가 설정되어 있는지 확인
2. 배포 계정에 Sepolia ETH 잔액이 있는지 확인 (Faucet: https://sepoliafaucet.com)
3. 배포 실행:

```bash
npm run deploy:sepolia
```

## 배포 후 작업

배포가 완료되면 출력된 컨트랙트 주소를 프론트엔드에 반영해야 합니다:

1. **컨트랙트 주소 업데이트**: `src/shared/config/index.ts` 파일에서 `CONTRACT_ADDRESS`를 배포된 주소로 변경

```typescript
// Before
export const CONTRACT_ADDRESS = '';

// After (예시)
export const CONTRACT_ADDRESS = '0x1234...abcd';
```

2. **ABI 추출**: 컨트랙트 변경이 있었다면 ABI도 업데이트

```bash
npm run copy-abi
```

3. **Etherscan 검증** (선택사항):

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## 스크립트 목록

| 스크립트 | 설명 |
|---------|------|
| `npm run compile` | Solidity 컨트랙트 컴파일 |
| `npm test` | 테스트 실행 |
| `npm run copy-abi` | ABI를 프론트엔드로 복사 (compile 먼저 실행 필요) |
| `npm run build` | 컴파일 + ABI 추출 한 번에 실행 |
| `npm run deploy:local` | Hardhat 로컬 네트워크에 배포 |
| `npm run deploy:sepolia` | Sepolia 테스트넷에 배포 |
