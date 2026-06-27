/** 지갑 연결 상태 (추후 web3 provider와 연동) */
export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type WalletState = {
  status: WalletStatus;
  /** 연결된 지갑 주소 — 미연결 시 null */
  address: string | null;
  /** 현재 chain 이름 */
  chainName: string | null;
  /** 연결/트랜잭션 실패 시 에러 메시지 */
  error: string | null;
};

export type WalletContextValue = {
  wallet: WalletState;
  /** @returns 연결 성공 여부 */
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  /** @returns 버튼에 표시할 라벨 (주소 단축 또는 "Connect Wallet") */
  getConnectButtonLabel: () => string;
  isConnected: boolean;
  isConnecting: boolean;
};
