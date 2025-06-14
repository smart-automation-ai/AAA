#!/bin/bash

# 🔄 Continuous GitHub Live Update Monitor
# =======================================
# Watches for file changes and automatically deploys to keep GitHub live

set -euo pipefail

# Configuration
WATCH_DIRS=("." "api")
WATCH_EXTENSIONS=("html" "css" "js" "py" "md")
DEPLOY_SCRIPT="./auto_deploy.sh"
COOLDOWN_SECONDS=30
LOG_FILE="watch_deploy.log"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Logging
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[$level]${NC} ${timestamp}: $message" | tee -a "$LOG_FILE"
}

# Check if inotify-tools is installed
check_dependencies() {
    if ! command -v inotifywait >/dev/null 2>&1; then
        log "ERROR" "inotify-tools not installed. Installing..."
        
        # Try to install based on the system
        if command -v apt-get >/dev/null 2>&1; then
            sudo apt-get update && sudo apt-get install -y inotify-tools
        elif command -v yum >/dev/null 2>&1; then
            sudo yum install -y inotify-tools
        elif command -v brew >/dev/null 2>&1; then
            brew install inotify-tools
        else
            log "ERROR" "Cannot install inotify-tools automatically. Please install manually."
            exit 1
        fi
    fi
    
    if [ ! -f "$DEPLOY_SCRIPT" ]; then
        log "ERROR" "Deploy script not found: $DEPLOY_SCRIPT"
        exit 1
    fi
    
    chmod +x "$DEPLOY_SCRIPT"
    log "SUCCESS" "Dependencies verified"
}

# Build watch pattern
build_watch_pattern() {
    local pattern=""
    for ext in "${WATCH_EXTENSIONS[@]}"; do
        if [ -n "$pattern" ]; then
            pattern="$pattern|"
        fi
        pattern="$pattern.*\.$ext$"
    done
    echo "$pattern"
}

# Deploy with cooldown
deploy_with_cooldown() {
    local last_deploy_file=".last_deploy"
    local current_time=$(date +%s)
    local last_deploy_time=0
    
    if [ -f "$last_deploy_file" ]; then
        last_deploy_time=$(cat "$last_deploy_file")
    fi
    
    local time_diff=$((current_time - last_deploy_time))
    
    if [ $time_diff -lt $COOLDOWN_SECONDS ]; then
        local remaining=$((COOLDOWN_SECONDS - time_diff))
        log "INFO" "Deployment cooldown active. Waiting ${remaining}s..."
        return 1
    fi
    
    log "INFO" "Triggering deployment..."
    echo "$current_time" > "$last_deploy_file"
    
    if "$DEPLOY_SCRIPT" --deploy; then
        log "SUCCESS" "Deployment completed successfully"
        return 0
    else
        log "ERROR" "Deployment failed"
        return 1
    fi
}

# Main monitoring loop
start_monitoring() {
    local watch_pattern=$(build_watch_pattern)
    
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║              🔄 CONTINUOUS DEPLOYMENT MONITOR 🔄             ║"
    echo "║                                                              ║"
    echo "║  Watching for changes in: ${WATCH_DIRS[*]}                   ║"
    echo "║  File types: ${WATCH_EXTENSIONS[*]}                          ║"
    echo "║  Cooldown: ${COOLDOWN_SECONDS}s between deployments          ║"
    echo "║                                                              ║"
    echo "║  Press Ctrl+C to stop monitoring                            ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log "INFO" "Starting continuous monitoring..."
    log "INFO" "Watch pattern: $watch_pattern"
    
    # Create watch command for all directories
    local watch_cmd="inotifywait -m -r -e modify,create,delete,move"
    for dir in "${WATCH_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            watch_cmd="$watch_cmd $dir"
        fi
    done
    
    # Start monitoring
    $watch_cmd --format '%w%f %e' | while read file event; do
        # Skip hidden files and directories
        if [[ "$file" =~ /\. ]] || [[ "$file" =~ ^\. ]]; then
            continue
        fi
        
        # Skip backup and log files
        if [[ "$file" =~ \.(log|bak|tmp|swp)$ ]] || [[ "$file" =~ backups/ ]]; then
            continue
        fi
        
        # Check if file matches our watch pattern
        if [[ "$file" =~ $watch_pattern ]]; then
            log "INFO" "Change detected: $file ($event)"
            
            # Wait a moment for file operations to complete
            sleep 2
            
            # Attempt deployment
            if deploy_with_cooldown; then
                log "SUCCESS" "Live update completed for: $file"
            else
                log "WARN" "Deployment skipped (cooldown or error)"
            fi
        fi
    done
}

# Cleanup on exit
cleanup() {
    log "INFO" "Stopping continuous monitoring..."
    pkill -f inotifywait 2>/dev/null || true
    log "INFO" "Monitor stopped"
    exit 0
}

# Handle signals
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    case "${1:-}" in
        "--help"|"-h")
            echo "Continuous GitHub Live Update Monitor"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --help, -h     Show this help message"
            echo "  --test         Test deployment once"
            echo "  --status       Show monitoring status"
            echo ""
            echo "This script continuously monitors file changes and automatically"
            echo "deploys to GitHub to keep your repository live and up-to-date."
            exit 0
            ;;
        "--test")
            check_dependencies
            log "INFO" "Testing deployment..."
            "$DEPLOY_SCRIPT" --deploy
            exit 0
            ;;
        "--status")
            if pgrep -f "watch_and_deploy.sh" >/dev/null; then
                echo "✅ Continuous monitoring is ACTIVE"
                echo "📊 Process ID: $(pgrep -f "watch_and_deploy.sh")"
                if [ -f "$LOG_FILE" ]; then
                    echo "📝 Last activity:"
                    tail -5 "$LOG_FILE"
                fi
            else
                echo "❌ Continuous monitoring is NOT running"
            fi
            exit 0
            ;;
        *)
            check_dependencies
            start_monitoring
            ;;
    esac
}

main "$@" 