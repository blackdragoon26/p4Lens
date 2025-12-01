#!/bin/bash

set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:-local}"
MODE_FILE="${PROJECT_ROOT}/.p4lens_mode"
BACKEND_LOG="${PROJECT_ROOT}/backend.log"
FRONTEND_LOG="${PROJECT_ROOT}/frontend.log"

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

cleanup_local_on_failure() {
    local exit_code=$?
    if [[ -n "${BACKEND_PID:-}" ]] && ps -p "${BACKEND_PID}" >/dev/null 2>&1; then
        kill "${BACKEND_PID}" || true
    fi
    if [[ -n "${FRONTEND_PID:-}" ]] && ps -p "${FRONTEND_PID}" >/dev/null 2>&1; then
        kill "${FRONTEND_PID}" || true
    fi
    exit "${exit_code}"
}

start_local() {
    echo "🔍 Starting P4Lens (local mode)..."
    echo "Checking prerequisites..."

    if ! command_exists python3; then
        echo "❌ Python 3 is not installed. Please install Python 3.11+"
        exit 1
    fi

    if ! command_exists node; then
        echo "❌ Node.js is not installed. Please install Node.js 20+"
        exit 1
    fi

    echo "✅ Prerequisites met"
    echo ""

    trap cleanup_local_on_failure ERR

    echo "🚀 Starting backend..."
    pushd "${PROJECT_ROOT}/backend" >/dev/null

    if [[ ! -d "venv" ]]; then
        echo "Creating virtual environment..."
        python3 -m venv venv
    fi

    # shellcheck disable=SC1091
    source venv/bin/activate

    echo "Installing backend dependencies (if needed)..."
    pip install -q -r requirements.txt

    echo "Starting FastAPI server on port 8000..."
    uvicorn main:app --reload --host 0.0.0.0 --port 8000 > "${BACKEND_LOG}" 2>&1 &
    BACKEND_PID=$!
    echo "Backend PID: ${BACKEND_PID}"

    popd >/dev/null

    echo ""
    echo "🎨 Starting frontend..."
    pushd "${PROJECT_ROOT}/frontend" >/dev/null

    if [[ ! -d "node_modules" ]]; then
        echo "Installing frontend dependencies..."
        npm install
    fi

    echo "Starting Vite dev server on port 5173..."
    npm run dev > "${FRONTEND_LOG}" 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend PID: ${FRONTEND_PID}"

    popd >/dev/null

    trap - ERR

    echo "${BACKEND_PID}" > "${PROJECT_ROOT}/.backend.pid"
    echo "${FRONTEND_PID}" > "${PROJECT_ROOT}/.frontend.pid"
    echo "local" > "${MODE_FILE}"

    echo ""
    echo "✅ P4Lens local stack is running!"
    echo "📍 Frontend: http://localhost:5173"
    echo "📍 Backend:  http://localhost:8000"
    echo "📍 API Docs: http://localhost:8000/docs"
    echo ""
    echo "📝 Logs saved to:"
    echo "   ${BACKEND_LOG}"
    echo "   ${FRONTEND_LOG}"
    echo ""
    echo "🛑 To stop: ./stop.sh"
}

start_docker() {
    local compose_bin
    compose_bin="$(detect_compose)"

    if [[ -z "${compose_bin}" ]]; then
        echo "❌ Docker is not installed or docker compose plugin is unavailable."
        exit 1
    fi

    echo "🐳 Starting P4Lens via Docker Compose..."
    pushd "${PROJECT_ROOT}" >/dev/null

    ${compose_bin} down -v --remove-orphans >/dev/null 2>&1 || true
    ${compose_bin} up -d --build

    echo "⏳ Waiting for backend health..."
    local healthy=0
    for _ in {1..20}; do
        if curl -fsS "http://localhost:8000/health" >/dev/null 2>&1; then
            echo "✅ Backend is healthy"
            healthy=1
            break
        fi
        sleep 3
    done

    if [[ ${healthy} -eq 0 ]]; then
        echo "❌ Backend did not become healthy in time."
        ${compose_bin} logs backend || true
        ${compose_bin} down -v --remove-orphans || true
        exit 1
    fi

    echo "docker" > "${MODE_FILE}"

    echo ""
    echo "✅ P4Lens docker stack is running!"
    echo "📍 Frontend: http://localhost:3000"
    echo "📍 Backend:  http://localhost:8000"
    echo ""
    echo "🛑 To stop: ./stop.sh"

    popd >/dev/null
}

usage() {
    cat <<EOF
Usage: ./start.sh [local|docker]

Modes:
  local   Start FastAPI + Vite directly on the host (default)
  docker  Start the production stack with docker compose
EOF
}

case "${MODE}" in
    local)
        start_local
        ;;
    docker|compose)
        start_docker
        ;;
    -h|--help|help)
        usage
        ;;
    *)
        echo "Unknown mode: ${MODE}"
        usage
        exit 1
        ;;
esac
