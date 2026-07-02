import { WizardScaffoldCard, WizardStepShell } from './wizard-step-shell';

export default function SetUnlockDateStep() {
  return (
    <WizardStepShell
      title="Set Unlock Date"
      description="Define when and how recipients can open this capsule."
    >
      <WizardScaffoldCard
        title="Unlock rules"
        items={[
          'Unlock date and time picker',
          'Visibility — public or private',
          'Encryption toggle',
          'Allowed wallet address (optional)',
          'Secret code unlock (optional)',
        ]}
      />
    </WizardStepShell>
  );
}
