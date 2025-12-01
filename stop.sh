#!/bin/bash

set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
MODE_FILE="${PROJECT_ROOT}/.p4lens_mode"
BACKEND_PID_FILE="${PROJECT_ROOT}/.backend.pid"
FRONTEND_PID_FILE="${PROJECT_ROOT}/.frontend.pid"

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

detect_compose() {
    if command_exists docker; then
        if docker compose version >/dev/null 2>&1; then
            echo "docker compose"
            return
        fi
    fi

    if command_exists docker-compose; then
        echo "docker-compose"
        return
    fi

    echo ""
}

stop_local_process() {
    local pid_file=$1
    local label=$2

    if [[ -f "${pid_file}" ]]; then
        local pid
        pid=$(cat "${pid_file}")
        if ps -p "${pid}" >/dev/null 2>&1; then
            echo "Stopping ${label} (PID: ${pid})..."
            kill "${pid}" >/dev/null 2>&1 || true
        fi
        rm -f "${pid_file}"
    fi
}

stop_docker_stack() {
    local compose_bin
    compose_bin="$(detect_compose)"

    if [[ -z "${compose_bin}" ]]; then
        echo "⚠️ Docker Compose not available, nothing to stop."
        return
    fi

    echo "🛑 Bringing down Docker stack..."
    pushd "${PROJECT_ROOT}" >/dev/null
    ${compose_bin} down -v --remove-orphans || true
    popd >/dev/null

    # Force-remove lingering containers if compose metadata was lost
    if command_exists docker; then
        docker rm -f p4lens-backend p4lens-frontend >/dev/null 2>&1 || true
    fi
}

echo "🛑 Stopping P4Lens..."

MODE="local"

if command_exists docker; then
    if docker ps --filter "name=p4lens-backend" --format "{{.ID}}" | grep -q . 2>/dev/null; then
        MODE="docker"
    fi
fi

if [[ -f "${MODE_FILE}" ]]; then
    MODE=$(cat "${MODE_FILE}")
fi

if [[ "${MODE}" == "docker" ]]; then
    stop_docker_stack
else
    stop_local_process "${BACKEND_PID_FILE}" "backend"
    stop_local_process "${FRONTEND_PID_FILE}" "frontend"
fi

rm -f "${MODE_FILE}"

echo "✅ P4Lens stopped"
