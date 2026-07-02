import CreateCapsuleWizard from '../components/create-capsule-wizard';
import { useCreateCapsule } from '../hooks/use-create-capsule';

export default function CreateCapsulePage() {
  const capsule = useCreateCapsule();

  return (
    <div className="mx-auto max-w-lg px-4 py-24 sm:px-6">
      <h1 className="font-display text-3xl font-bold tracking-tight">Create Capsule</h1>
      <p className="mt-3 text-muted-foreground">
        Follow the steps to add memories, configure your capsule, and seal on-chain.
      </p>

      <div className="mt-8">
        <CreateCapsuleWizard capsule={capsule} />
      </div>
    </div>
  );
}
