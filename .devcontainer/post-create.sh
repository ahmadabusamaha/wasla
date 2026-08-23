#!/usr/bin/env bash
# Wasla — Codespaces / fresh-machine bootstrap
# Installs dependencies + Supabase CLI + OpenCode. No secrets handled here.
set -euo pipefail

echo "▸ npm install"
npm install

echo "▸ Supabase CLI"
mkdir -p "$HOME/.local/bin"
case "$(uname -m)" in
  x86_64) SUPA_ARCH="linux_amd64" ;;
  aarch64 | arm64) SUPA_ARCH="linux_arm64" ;;
  *) echo "unsupported arch"; exit 1 ;;
esac
if ! command -v supabase >/dev/null 2>&1; then
  curl -fsSL "https://github.com/supabase/cli/releases/latest/download/supabase_${SUPA_ARCH}.tar.gz" \
    | tar -xz -C "$HOME/.local/bin" supabase
fi
grep -q '.local/bin' ~/.bashrc 2>/dev/null || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

echo "▸ OpenCode"
if ! command -v opencode >/dev/null 2>&1; then
  curl -fsSL https://opencode.ai/install | bash
fi

echo ""
echo "✅ Setup complete."
echo "Next steps:"
echo "  1. cp .env.example .env.local   # then fill values from your Supabase dashboard"
echo "  2. supabase login               # one-time browser auth (optional, for migrations)"
echo "  3. npm run dev"
