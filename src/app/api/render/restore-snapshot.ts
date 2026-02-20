import { head } from "@vercel/blob";
import { Sandbox } from "@vercel/sandbox";

const SANDBOX_CREATING_TIMEOUT = 5 * 60 * 1000;

const getSnapshotBlobKey = () =>
  `snapshot-cache/${process.env.VERCEL_DEPLOYMENT_ID ?? "local"}.json`;

export async function restoreSnapshot() {
  let snapshotId: string | null = null;

  try {
    const metadata = await head(getSnapshotBlobKey(), {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const response = await fetch(metadata.url);
    const cache: { snapshotId: string } = await response.json();
    snapshotId = cache.snapshotId;
  } catch {
    // ignore
  }

  if (!snapshotId) {
    throw new Error(
      "No sandbox snapshot found. Run `bun run create-snapshot` as part of the build process.",
    );
  }

  return Sandbox.create({
    source: { type: "snapshot", snapshotId },
    timeout: SANDBOX_CREATING_TIMEOUT,
  });
}
