#!/usr/bin/env bash
# Downloads the KoSIT validator and the Peppol BIS Billing 3 configuration,
# then starts the validator in daemon mode.
#
# Usage:
#   scripts/kosit.sh            # download (if needed) and start in foreground
#   scripts/kosit.sh download   # only download
#
# Environment:
#   KOSIT_VALIDATOR_VERSION  validator release (default 1.6.3)
#   KOSIT_BIS_VERSION        BIS configuration release (default 3.0.21)
#   KOSIT_PORT               daemon port (default 8081)
#   KOSIT_DIR                cache directory (default .kosit)
set -euo pipefail

VALIDATOR_VERSION="${KOSIT_VALIDATOR_VERSION:-1.6.3}"
BIS_VERSION="${KOSIT_BIS_VERSION:-3.0.21}"
PORT="${KOSIT_PORT:-8081}"
DIR="${KOSIT_DIR:-.kosit}"

JAR="$DIR/validator-$VALIDATOR_VERSION-standalone.jar"
CONF="$DIR/bis-$BIS_VERSION"

mkdir -p "$DIR"

if [ ! -f "$JAR" ]; then
    echo "Downloading KoSIT validator $VALIDATOR_VERSION..."
    curl -fsSL -o "$JAR" \
        "https://github.com/itplr-kosit/validator/releases/download/v$VALIDATOR_VERSION/validator-$VALIDATOR_VERSION-standalone.jar"
fi

if [ ! -f "$CONF/scenarios.xml" ]; then
    echo "Downloading Peppol BIS configuration $BIS_VERSION..."
    curl -fsSL -o "$DIR/bis-$BIS_VERSION.zip" \
        "https://github.com/itplr-kosit/validator-configuration-bis/releases/download/release-$BIS_VERSION/validation-configuration-bis-$BIS_VERSION.zip"
    mkdir -p "$CONF"
    unzip -qo "$DIR/bis-$BIS_VERSION.zip" -d "$CONF"
    rm "$DIR/bis-$BIS_VERSION.zip"
fi

if [ "${1:-}" = "download" ]; then
    exit 0
fi

# Force English so XSD messages are identical on every machine
exec java -Duser.language=en -Duser.country=US -jar "$JAR" \
    -s "$CONF/scenarios.xml" \
    -r "$CONF" \
    -D -G -H 0.0.0.0 -P "$PORT"
