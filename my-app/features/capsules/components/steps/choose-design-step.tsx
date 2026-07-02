import { WizardScaffoldCard, WizardStepShell } from './wizard-step-shell';

export default function ChooseDesignStep() {
  return (
    <WizardStepShell
      title="Choose Design"
      description="Select the visual style that represents your capsule."
    >
      <WizardScaffoldCard
        title="Capsule designs"
        items={[
          'Glass Orb',
          'Cosmic Vault',
          'Crystal Cube',
          'Ancient Archive',
          'Hologram Capsule',
        ]}
      />
    </WizardStepShell>
  );
}
