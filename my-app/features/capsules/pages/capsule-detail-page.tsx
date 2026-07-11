import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  FlaskConical,
  Loader2,
  Lock,
  LockOpen,
  PackageOpen,
} from 'lucide-react';
import { useReadContract } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  isOnchainEnabled,
  TIME_CAPSULE_ABI,
  TIME_CAPSULE_ADDRESS,
} from '@/config/timecapsule';
import { useWallet } from '@/hooks/use-wallet';
import { useOpenCapsule } from '../hooks/use-open-capsule';
import { loadLocalCapsules } from '../lib/capsule-store';
import { fetchCapsuleMetadata, ipfsUrl } from '../lib/ipfs-gateway';
import { formatUnlockDisplay } from '../lib/unlock-date';
import {
  CAPSULE_STATE_LABELS,
  getCapsuleState,
} from '../types/capsule-summary';
import { CAPSULE_DESIGN_LABELS } from '../types/create-capsule';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function isNumericId(id: string): boolean {
  return /^\d+$/.test(id);
}

export default function CapsuleDetailPage() {
  const { id = '' } = useParams();
  const { wallet, isConnected } = useWallet();
  const { openCapsule, status: openStatus } = useOpenCapsule();
  const onchain = isOnchainEnabled() && isNumericId(id);
  const isOpening = openStatus === 'awaiting_signature' || openStatus === 'submitting';

  const read = useReadContract({
    abi: TIME_CAPSULE_ABI,
    address: (TIME_CAPSULE_ADDRESS || undefined) as `0x${string}` | undefined,
    chainId: sepolia.id,
    functionName: 'getCapsule',
    args: [onchain ? BigInt(id) : 0n],
    query: { enabled: onchain },
  });


  const localRecord = !onchain && wallet.address
    ? loadLocalCapsules(wallet.address).find((record) => record.id === id)
    : undefined;

  const capsule = onchain
    ? read.data && read.data.owner !== ZERO_ADDRESS
      ? {
          metadataCid: read.data.ipfsHash,
          unlockAt: new Date(Number(read.data.unlockTime) * 1000).toISOString(),
          isOpened: read.data.isOpened,
          owner: read.data.owner as string,
        }
      : undefined
    : localRecord && {
        metadataCid: localRecord.metadataCid,
        unlockAt: localRecord.unlockAt,
        isOpened: localRecord.isOpened,
        owner: localRecord.owner,
      };

  const state = capsule ? getCapsuleState(capsule) : undefined;
  const isOwner =
    capsule && wallet.address
      ? capsule.owner.toLowerCase() === wallet.address.toLowerCase()
      : false;

  const metadataQuery = useQuery({
    queryKey: ['capsule-metadata', capsule?.metadataCid],
    queryFn: () => fetchCapsuleMetadata(capsule!.metadataCid),
    enabled: Boolean(onchain && capsule?.isOpened && capsule.metadataCid),
    staleTime: Infinity,
    retry: 1,
  });

  const handleOpen = async () => {
    await openCapsule(id);
    void read.refetch();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <Link
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        to="/capsules"
      >
        <ArrowLeft className="size-4" />
        My Capsules
      </Link>

      {onchain && read.isLoading ? (
        <p className="mt-8 text-muted-foreground">Loading capsule…</p>
      ) : !capsule ? (
        <Card className="mt-8">
          <CardContent className="py-12 text-center text-muted-foreground">
            캡슐을 찾을 수 없습니다.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Capsule #{id}
            </h1>
            {state ? (
              <Badge className="gap-1" variant="outline">
                {state === 'opened' ? (
                  <PackageOpen className="size-3" />
                ) : state === 'unlockable' ? (
                  <LockOpen className="size-3" />
                ) : (
                  <Lock className="size-3" />
                )}
                {CAPSULE_STATE_LABELS[state]}
              </Badge>
            ) : null}
          </div>

          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Capsule info</CardTitle>
              <CardDescription>
                {capsule.isOpened ? 'Opened' : 'Opens'} · {formatUnlockDisplay(capsule.unlockAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <p className="font-mono text-xs text-muted-foreground" title={capsule.metadataCid}>
                CID {capsule.metadataCid}
              </p>
              <p className="font-mono text-xs text-muted-foreground" title={capsule.owner}>
                Owner {capsule.owner}
              </p>
            </CardContent>
          </Card>

          {!capsule.isOpened ? (
            <Card className="mt-4">
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                {state === 'unlockable' ? (
                  isOwner ? (
                    <>
                      <p className="text-muted-foreground">
                        개봉 시각이 지났습니다. 트랜잭션으로 캡슐을 개봉하세요.
                      </p>
                      <Button
                        className="gap-1.5"
                        disabled={isOpening || !isConnected}
                        onClick={() => void handleOpen()}
                      >
                        {isOpening ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            개봉 중…
                          </>
                        ) : (
                          <>
                            <LockOpen className="size-4" />
                            캡슐 개봉하기
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <p className="text-muted-foreground">캡슐 소유자만 개봉할 수 있습니다.</p>
                  )
                ) : (
                  <>
                    <Lock className="size-6 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      이 캡슐은 {formatUnlockDisplay(capsule.unlockAt)}에 열 수 있습니다.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ) : !onchain ? (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <FlaskConical className="size-3.5" />
              mock 모드 캡슐 — 실제 IPFS 콘텐츠 열람은 온체인 캡슐에서 가능합니다.
            </p>
          ) : metadataQuery.isLoading ? (
            <p className="mt-6 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              IPFS에서 콘텐츠를 불러오는 중…
            </p>
          ) : metadataQuery.isError ? (
            <Card className="mt-4">
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-muted-foreground">콘텐츠를 불러오지 못했습니다.</p>
                <Button variant="outline" onClick={() => void metadataQuery.refetch()}>
                  다시 시도
                </Button>
              </CardContent>
            </Card>
          ) : metadataQuery.data ? (
            <div className="mt-6 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {CAPSULE_DESIGN_LABELS[metadataQuery.data.design] ?? 'Capsule'} ·{' '}
                    {metadataQuery.data.files.length}{' '}
                    {metadataQuery.data.files.length === 1 ? 'memory' : 'memories'}
                  </CardTitle>
                  <CardDescription>
                    Sealed {formatUnlockDisplay(metadataQuery.data.createdAt)}
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                {metadataQuery.data.files.map((file) =>
                  file.category === 'photo' ? (
                    <a
                      className="group overflow-hidden rounded-xl border"
                      href={ipfsUrl(file.cid)}
                      key={file.cid}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <img
                        alt={file.name}
                        className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                        src={ipfsUrl(file.cid)}
                      />
                      <p className="truncate px-3 py-2 text-xs text-muted-foreground">
                        {file.name}
                      </p>
                    </a>
                  ) : (
                    <a
                      className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-accent"
                      href={ipfsUrl(file.cid)}
                      key={file.cid}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <FileText className="size-5 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                      <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                    </a>
                  ),
                )}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
