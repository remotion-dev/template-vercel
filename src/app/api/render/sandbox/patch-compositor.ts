import { Sandbox } from "@vercel/sandbox";

const GLIBC_DIR = "/opt/glibc235";
const LIBC6_DEB_URL =
  "http://archive.ubuntu.com/ubuntu/pool/main/g/glibc/libc6_2.35-0ubuntu3.9_amd64.deb";

/**
 * Patches the Remotion compositor binary to use a bundled glibc 2.35.
 *
 * Vercel Sandbox runs Amazon Linux 2023 which ships glibc 2.34,
 * but the compositor binary requires glibc 2.35.
 * We download Ubuntu 22.04's libc6 package and use patchelf to
 * point the compositor at the bundled glibc.
 *
 * Only the `remotion` binary needs patching — ffmpeg/ffprobe work fine on glibc 2.34.
 */
export async function patchCompositor({
  sandbox,
}: {
  sandbox: Sandbox;
}): Promise<void> {
  const script = `
set -euo pipefail

COMPOSITOR_BIN="$(find node_modules/@remotion/compositor-linux-x64-gnu -name remotion -type f | head -1)"

if [ -z "$COMPOSITOR_BIN" ]; then
  echo "Compositor binary not found, skipping patch"
  exit 0
fi

# Check if patch is needed by looking at the required glibc version
NEEDS_PATCH=$(readelf -V "$COMPOSITOR_BIN" 2>/dev/null | grep -c "GLIBC_2\\.3[5-9]\\|GLIBC_2\\.[4-9]" || true)
if [ "$NEEDS_PATCH" = "0" ]; then
  echo "Compositor does not require glibc > 2.34, skipping patch"
  exit 0
fi

# Download and extract glibc 2.35 from Ubuntu 22.04
mkdir -p ${GLIBC_DIR}
cd /tmp
curl -fsSL -o libc6.deb "${LIBC6_DEB_URL}"
ar x libc6.deb
zstd -d data.tar.zst -o data.tar
tar xf data.tar -C ${GLIBC_DIR} --strip-components=1
rm -f libc6.deb data.tar data.tar.zst control.tar.zst debian-binary

cd -

# Patch the compositor binary
patchelf \\
  --set-interpreter ${GLIBC_DIR}/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2 \\
  --force-rpath \\
  --set-rpath ${GLIBC_DIR}/lib/x86_64-linux-gnu:\\$ORIGIN \\
  "$COMPOSITOR_BIN"

echo "Compositor patched successfully"
`;

  const cmd = await sandbox.runCommand({
    cmd: "bash",
    args: ["-c", script],
    detached: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for await (const _log of cmd.logs()) {
    // Consume logs
  }

  const result = await cmd.wait();
  if (result.exitCode !== 0) {
    throw new Error(
      `Failed to patch compositor: ${await result.stderr()} ${await result.stdout()}`,
    );
  }
}
