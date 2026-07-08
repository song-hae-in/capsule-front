import * as fs from "fs";
import * as path from "path";

function main() {
  const artifactPath = path.resolve(
    __dirname,
    "../artifacts/contracts/TimeCapsule.sol/TimeCapsule.json"
  );

  if (!fs.existsSync(artifactPath)) {
    console.error("Error: Artifact not found at", artifactPath);
    console.error("Run 'npx hardhat compile' first.");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  const abi = artifact.abi;

  // capsule-front 프론트 루트는 my-app/ — src/shared가 아닌 my-app/src/config로 출력
  const outputPath = path.resolve(
    __dirname,
    "../../my-app/src/config/abi.ts"
  );

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const content = `/**
 * TimeCapsule 스마트 컨트랙트 ABI
 * 이 파일은 자동 생성됩니다. 직접 수정하지 마세요.
 * 생성 명령: cd contracts && npm run copy-abi
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TIMECAPSULE_ABI = ${JSON.stringify(abi, null, 2)} as const;
`;

  fs.writeFileSync(outputPath, content, "utf-8");
  console.log("ABI extracted successfully!");
  console.log("  From:", artifactPath);
  console.log("  To:  ", outputPath);
}

main();
