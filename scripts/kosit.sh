#!/usr/bin/env bash
# Downloads the KoSIT validator and its configuration, then starts the
# validator in daemon mode.
#
# Usage:
#   scripts/kosit.sh                    # Peppol BIS Billing 3: download (if needed) and start in foreground
#   scripts/kosit.sh download           # only download
#   scripts/kosit.sh en16931            # EN 16931 without CIUS (CEN rules only): download (if needed) and start
#   scripts/kosit.sh en16931 download   # only download
#
# Environment:
#   KOSIT_VALIDATOR_VERSION  validator release (default 1.6.3)
#   KOSIT_BIS_VERSION        BIS configuration release (default 3.0.21)
#   KOSIT_CEN_VERSION        EN 16931 validation artefacts release (default 1.3.17)
#   KOSIT_PORT               Peppol BIS daemon port (default 8081)
#   KOSIT_EN16931_PORT       EN 16931 daemon port (default 8082)
#   KOSIT_DIR                cache directory (default .kosit)
set -euo pipefail

VALIDATOR_VERSION="${KOSIT_VALIDATOR_VERSION:-1.6.3}"
BIS_VERSION="${KOSIT_BIS_VERSION:-3.0.21}"
CEN_VERSION="${KOSIT_CEN_VERSION:-1.3.17}"
PORT="${KOSIT_PORT:-8081}"
EN16931_PORT="${KOSIT_EN16931_PORT:-8082}"
DIR="${KOSIT_DIR:-.kosit}"

PROFILE=peppol
if [ "${1:-}" = "en16931" ]; then
    PROFILE=en16931
    shift
fi

JAR="$DIR/validator-$VALIDATOR_VERSION-standalone.jar"
CONF="$DIR/bis-$BIS_VERSION"
CEN="$DIR/en16931-$CEN_VERSION"

mkdir -p "$DIR"

if [ ! -f "$JAR" ]; then
    echo "Downloading KoSIT validator $VALIDATOR_VERSION..."
    curl -fsSL -o "$JAR" \
        "https://github.com/itplr-kosit/validator/releases/download/v$VALIDATOR_VERSION/validator-$VALIDATOR_VERSION-standalone.jar"
fi

# Also needed by the EN 16931 profile, for the UBL schemas and the report stylesheets
if [ ! -f "$CONF/scenarios.xml" ]; then
    echo "Downloading Peppol BIS configuration $BIS_VERSION..."
    curl -fsSL -o "$DIR/bis-$BIS_VERSION.zip" \
        "https://github.com/itplr-kosit/validator-configuration-bis/releases/download/release-$BIS_VERSION/validation-configuration-bis-$BIS_VERSION.zip"
    mkdir -p "$CONF"
    unzip -qo "$DIR/bis-$BIS_VERSION.zip" -d "$CONF"
    rm "$DIR/bis-$BIS_VERSION.zip"
fi

if [ "$PROFILE" = "en16931" ]; then
    if [ ! -f "$CEN/xslt/EN16931-UBL-validation.xslt" ]; then
        echo "Downloading EN 16931 validation artefacts $CEN_VERSION..."
        curl -fsSL -o "$DIR/en16931-ubl-$CEN_VERSION.zip" \
            "https://github.com/ConnectingEurope/eInvoicing-EN16931/releases/download/validation-$CEN_VERSION/en16931-ubl-$CEN_VERSION.zip"
        mkdir -p "$CEN"
        unzip -qo "$DIR/en16931-ubl-$CEN_VERSION.zip" 'xslt/*' -d "$CEN"
        rm "$DIR/en16931-ubl-$CEN_VERSION.zip"
    fi
    if [ ! -d "$CEN/resources/ubl" ]; then
        mkdir -p "$CEN/resources"
        cp -R "$CONF/resources/ubl" "$CEN/resources/"
        cp "$CONF/resources/xrechnung-report.xsl" "$CONF/resources/default-report.xsl" "$CEN/resources/"
    fi
fi

if [ "${1:-}" = "download" ]; then
    exit 0
fi

if [ "$PROFILE" = "en16931" ]; then
    SCENARIOS="$(dirname "$0")/kosit-en16931-scenarios.xml"
    REPOSITORY="$CEN"
    PORT="$EN16931_PORT"
else
    SCENARIOS="$CONF/scenarios.xml"
    REPOSITORY="$CONF"
fi

# Force English so XSD messages are identical on every machine
exec java -Duser.language=en -Duser.country=US -jar "$JAR" \
    -s "$SCENARIOS" \
    -r "$REPOSITORY" \
    -D -G -H 0.0.0.0 -P "$PORT"
