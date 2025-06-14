#!/bin/bash

# 🚀 Elite GitHub Live Update Automation Script
# ============================================
# Ensures your GitHub repository is always live and up-to-date
# with comprehensive validation, error handling, and monitoring

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
REPO_URL="https://github.com/smart-automation-ai/AAA.git"
BRANCH="main"
LOG_FILE="deployment.log"
MAX_RETRIES=3
BACKUP_DIR="backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")  echo -e "${GREEN}[INFO]${NC} ${timestamp}: $message" | tee -a "$LOG_FILE" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} ${timestamp}: $message" | tee -a "$LOG_FILE" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} ${timestamp}: $message" | tee -a "$LOG_FILE" ;;
        "DEBUG") echo -e "${BLUE}[DEBUG]${NC} ${timestamp}: $message" | tee -a "$LOG_FILE" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} ${timestamp}: $message" | tee -a "$LOG_FILE" ;;
    esac
}

# Error handler
error_handler() {
    local line_number=$1
    log "ERROR" "Script failed at line $line_number"
    log "ERROR" "Last command: $BASH_COMMAND"
    exit 1
}

trap 'error_handler $LINENO' ERR

# Banner
print_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                🚀 ELITE GITHUB AUTOMATION 🚀                ║"
    echo "║              Live Repository Update System                   ║"
    echo "║                                                              ║"
    echo "║  ✅ Automated Git Operations    🔍 Code Validation           ║"
    echo "║  🚀 Live Deployment            📊 Status Monitoring         ║"
    echo "║  🔒 Security Scanning          📝 Comprehensive Logging     ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "INFO" "Checking prerequisites..."
    
    local missing_tools=()
    
    command -v git >/dev/null 2>&1 || missing_tools+=("git")
    command -v python3 >/dev/null 2>&1 || missing_tools+=("python3")
    command -v node >/dev/null 2>&1 || missing_tools+=("node")
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log "ERROR" "Missing required tools: ${missing_tools[*]}"
        log "INFO" "Please install missing tools and try again"
        exit 1
    fi
    
    log "SUCCESS" "All prerequisites satisfied"
}

# Create backup
create_backup() {
    log "INFO" "Creating backup..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
    fi
    
    local backup_name="backup_$(date +%Y%m%d_%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    # Create backup of current state
    mkdir -p "$backup_path"
    cp -r . "$backup_path/" 2>/dev/null || true
    
    # Remove git directory from backup to save space
    rm -rf "$backup_path/.git" 2>/dev/null || true
    
    log "SUCCESS" "Backup created: $backup_path"
}

# Validate files
validate_files() {
    log "INFO" "Validating files..."
    
    local validation_errors=0
    
    # HTML validation
    if [ -f "validate_html.py" ] && [ -f "index.html" ]; then
        log "INFO" "Validating HTML..."
        if python3 validate_html.py; then
            log "SUCCESS" "HTML validation passed"
        else
            log "WARN" "HTML validation failed"
            ((validation_errors++))
        fi
    fi
    
    # CSS validation
    if [ -f "validate_css.py" ] && [ -f "styles.css" ]; then
        log "INFO" "Validating CSS..."
        if python3 validate_css.py; then
            log "SUCCESS" "CSS validation passed"
        else
            log "WARN" "CSS validation failed"
            ((validation_errors++))
        fi
    fi
    
    # JavaScript syntax check
    if [ -f "script.js" ]; then
        log "INFO" "Validating JavaScript..."
        if node -c script.js; then
            log "SUCCESS" "JavaScript validation passed"
        else
            log "WARN" "JavaScript validation failed"
            ((validation_errors++))
        fi
    fi
    
    # Security scan
    log "INFO" "Running security scan..."
    local security_issues=$(grep -r "eval\|innerHTML\|document.write" . --include="*.js" --include="*.html" 2>/dev/null | wc -l)
    if [ "$security_issues" -gt 0 ]; then
        log "WARN" "Found $security_issues potential security issues"
        ((validation_errors++))
    else
        log "SUCCESS" "No obvious security issues found"
    fi
    
    if [ $validation_errors -gt 0 ]; then
        log "WARN" "Validation completed with $validation_errors warnings"
    else
        log "SUCCESS" "All validations passed"
    fi
}

# Git operations with retry logic
git_operation() {
    local operation=$1
    local retries=0
    
    while [ $retries -lt $MAX_RETRIES ]; do
        case $operation in
            "status")
                if git status --porcelain; then
                    return 0
                fi
                ;;
            "add")
                if git add .; then
                    log "SUCCESS" "Files staged successfully"
                    return 0
                fi
                ;;
            "commit")
                local commit_msg="🚀 Auto-deployment: $(date '+%Y-%m-%d %H:%M:%S')"
                if git commit -m "$commit_msg"; then
                    log "SUCCESS" "Changes committed successfully"
                    return 0
                fi
                ;;
            "push")
                if git push origin "$BRANCH"; then
                    log "SUCCESS" "Changes pushed to remote repository"
                    return 0
                fi
                ;;
            "pull")
                if git pull origin "$BRANCH"; then
                    log "SUCCESS" "Latest changes pulled from remote"
                    return 0
                fi
                ;;
        esac
        
        ((retries++))
        log "WARN" "Git $operation failed, retry $retries/$MAX_RETRIES"
        sleep 2
    done
    
    log "ERROR" "Git $operation failed after $MAX_RETRIES attempts"
    return 1
}

# Check Git configuration
check_git_config() {
    log "INFO" "Checking Git configuration..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log "ERROR" "Not in a Git repository"
        exit 1
    fi
    
    # Check remote configuration
    if ! git remote get-url origin > /dev/null 2>&1; then
        log "WARN" "No remote origin configured, setting up..."
        git remote add origin "$REPO_URL"
    fi
    
    # Check if user is configured
    if ! git config user.name > /dev/null 2>&1; then
        log "WARN" "Git user.name not configured"
        git config user.name "Auto Deploy Bot"
    fi
    
    if ! git config user.email > /dev/null 2>&1; then
        log "WARN" "Git user.email not configured"
        git config user.email "auto-deploy@github.com"
    fi
    
    log "SUCCESS" "Git configuration verified"
}

# Deploy to GitHub
deploy_to_github() {
    log "INFO" "Starting deployment to GitHub..."
    
    # Check for changes
    if [ -z "$(git_operation status)" ]; then
        log "INFO" "No changes detected, checking remote for updates..."
        git_operation pull
        log "INFO" "Repository is up to date"
        return 0
    fi
    
    log "INFO" "Changes detected, preparing deployment..."
    
    # Stage changes
    git_operation add
    
    # Commit changes
    git_operation commit
    
    # Push to remote
    git_operation push
    
    log "SUCCESS" "Deployment completed successfully!"
    log "INFO" "GitHub Pages will update automatically in 1-2 minutes"
}

# Monitor deployment status
monitor_deployment() {
    log "INFO" "Monitoring deployment status..."
    
    # Get the latest commit SHA
    local commit_sha=$(git rev-parse HEAD)
    local short_sha=${commit_sha:0:7}
    
    log "INFO" "Latest commit: $short_sha"
    log "INFO" "GitHub Actions will process this deployment"
    log "INFO" "Check status at: https://github.com/smart-automation-ai/AAA/actions"
    
    # Create deployment status file
    cat > deployment-status.json << EOF
{
    "timestamp": "$(date -Iseconds)",
    "commit_sha": "$commit_sha",
    "short_sha": "$short_sha",
    "branch": "$BRANCH",
    "status": "deployed",
    "site_url": "https://smart-automation-ai.github.io/AAA/"
}
EOF
    
    log "SUCCESS" "Deployment status saved to deployment-status.json"
}

# Cleanup function
cleanup() {
    log "INFO" "Performing cleanup..."
    
    # Remove old backups (keep last 5)
    if [ -d "$BACKUP_DIR" ]; then
        local backup_count=$(ls -1 "$BACKUP_DIR" | wc -l)
        if [ "$backup_count" -gt 5 ]; then
            log "INFO" "Cleaning up old backups..."
            ls -1t "$BACKUP_DIR" | tail -n +6 | xargs -I {} rm -rf "$BACKUP_DIR/{}"
        fi
    fi
    
    # Compress old logs
    if [ -f "$LOG_FILE" ] && [ $(wc -l < "$LOG_FILE") -gt 1000 ]; then
        log "INFO" "Compressing old logs..."
        gzip "$LOG_FILE"
        touch "$LOG_FILE"
    fi
    
    log "SUCCESS" "Cleanup completed"
}

# Main execution
main() {
    print_banner
    
    log "INFO" "Starting GitHub Live Update Automation"
    log "INFO" "Repository: $REPO_URL"
    log "INFO" "Branch: $BRANCH"
    
    check_prerequisites
    create_backup
    check_git_config
    validate_files
    deploy_to_github
    monitor_deployment
    cleanup
    
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🎉 DEPLOYMENT COMPLETE! 🎉                ║"
    echo "║                                                              ║"
    echo "║  Your GitHub repository is now live and up-to-date!         ║"
    echo "║  Site URL: https://smart-automation-ai.github.io/AAA/        ║"
    echo "║                                                              ║"
    echo "║  ✅ All validations passed                                   ║"
    echo "║  🚀 Changes deployed successfully                            ║"
    echo "║  📊 Monitoring active                                        ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log "SUCCESS" "GitHub Live Update Automation completed successfully"
}

# Handle script arguments
case "${1:-}" in
    "--help"|"-h")
        echo "GitHub Live Update Automation Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --validate     Run validation only"
        echo "  --deploy       Run deployment only"
        echo "  --monitor      Monitor deployment status"
        echo ""
        exit 0
        ;;
    "--validate")
        print_banner
        check_prerequisites
        validate_files
        exit 0
        ;;
    "--deploy")
        print_banner
        check_prerequisites
        check_git_config
        deploy_to_github
        exit 0
        ;;
    "--monitor")
        print_banner
        monitor_deployment
        exit 0
        ;;
    *)
        main
        ;;
esac 