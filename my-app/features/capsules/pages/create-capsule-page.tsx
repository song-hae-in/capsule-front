import MemoryFileUpload from '../components/memory-file-upload';
import ReviewSealStep from '../components/steps/review-seal-step';
import { useCreateCapsule } from '../hooks/use-create-capsule';

export default function CreateCapsulePage() {
  const {
    files,
    addFiles,
    removeFile,
    buffer,
    design,
    unlock,
    totalBytes,
    isSealing,
    isSealLocked,
    sealCapsule,
    retryBlockchainRecord,
    retryMetadataPin,
    retryUpload,
  } = useCreateCapsule();

  return (
    <div className="mx-auto max-w-lg px-4 py-24 sm:px-6">
      <h1 className="font-display text-3xl font-bold tracking-tight">Create Capsule</h1>
      <p className="mt-3 text-muted-foreground">
        Add memories locally, then seal to IPFS and on-chain when you are ready.
      </p>

      <div className="mt-8 space-y-12">
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">Add Memories</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Step 1 — files stay in your browser until you seal.
            </p>
          </div>
          <MemoryFileUpload
            files={files}
            onFilesSelect={addFiles}
            onRemove={removeFile}
            disabled={isSealLocked}
          />
        </section>

        <ReviewSealStep
          files={files}
          buffer={buffer}
          design={design}
          unlock={unlock}
          totalBytes={totalBytes}
          isSealing={isSealing}
          onSeal={sealCapsule}
          onRetryBlockchain={retryBlockchainRecord}
          onRetryMetadata={retryMetadataPin}
          onRetryFile={retryUpload}
        />
      </div>
    </div>
  );
}
