#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="ghcr.io/calibrain/shelfmark"
IMAGE_TAG="latest"
REMOTE_HOST="peter@jellyfin"
REMOTE_COMPOSE="/home/peter/docker-compose.yml"
TARBALL="shelfmark.tar"

# 1. Build image locally
docker build --target shelfmark -t "${IMAGE_NAME}:${IMAGE_TAG}" .

# 2. Save to tarball
docker save "${IMAGE_NAME}:${IMAGE_TAG}" -o "${TARBALL}"

# 3. Transfer to server
scp "${TARBALL}" "${REMOTE_HOST}:/tmp/${TARBALL}"

# 4. SSH: load image, restart container, clean up remote tarball
ssh "${REMOTE_HOST}" bash -s <<EOF
  set -euo pipefail
  docker load -i /tmp/${TARBALL}
  rm -f /tmp/${TARBALL}
  docker compose -f ${REMOTE_COMPOSE} up -d --force-recreate shelfmark
  docker image prune -f
EOF

# 5. Clean up local tarball
rm -f "${TARBALL}"

echo "Deploy complete."
