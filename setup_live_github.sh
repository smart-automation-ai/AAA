#!/bin/bash

# 🚀 Elite GitHub Live Update Setup Script
# ========================================
# Complete automation setup for live GitHub repository updates

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
REPO_URL="https://github.com/smart-automation-ai/AAA.git"
SERVICE_NAME="github-live-update"
CURRENT_USER=$(whoami)
CURRENT_DIR=$(pwd)

# Logging
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")  echo -e "${GREEN}[INFO]${NC} ${timestamp}: $message" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} ${timestamp}: $message" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} ${timestamp}: $message" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} ${timestamp}: $message" ;;
    esac
}

# Banner
print_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║           🚀 ELITE GITHUB LIVE UPDATE SETUP 🚀              ║"
    echo "║                                                              ║"
    echo "║  This script will configure complete automation for your     ║"
    echo "║  GitHub repository to ensure it's always live and updated.   ║"
    echo "║                                                              ║"
    echo "║  Features:                                                   ║"
    echo "║  ✅ Automated Git operations                                 ║"
    echo "║  🔄 Continuous file monitoring                               ║"
    echo "║  🚀 GitHub Actions deployment                                ║"
    echo "║  📊 Comprehensive logging                                    ║"
    echo "║  🔒 Security scanning                                        ║"
    echo "║  🛡️  System service integration                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check system requirements
check_requirements() {
    log "INFO" "Checking system requirements..."
    
    local missing_tools=()
    
    # Essential tools
    command -v git >/dev/null 2>&1 || missing_tools+=("git")
    command -v python3 >/dev/null 2>&1 || missing_tools+=("python3")
    command -v node >/dev/null 2>&1 || missing_tools+=("node")
    command -v curl >/dev/null 2>&1 || missing_tools+=("curl")
    
    # Check for package manager
    local package_manager=""
    if command -v apt-get >/dev/null 2>&1; then
        package_manager="apt-get"
    elif command -v yum >/dev/null 2>&1; then
        package_manager="yum"
    elif command -v dnf >/dev/null 2>&1; then
        package_manager="dnf"
    elif command -v brew >/dev/null 2>&1; then
        package_manager="brew"
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log "WARN" "Missing tools: ${missing_tools[*]}"
        
        if [ -n "$package_manager" ]; then
            log "INFO" "Attempting to install missing tools..."
            case $package_manager in
                "apt-get")
                    sudo apt-get update
                    for tool in "${missing_tools[@]}"; do
                        case $tool in
                            "node") sudo apt-get install -y nodejs npm ;;
                            *) sudo apt-get install -y "$tool" ;;
                        esac
                    done
                    ;;
                "yum"|"dnf")
                    for tool in "${missing_tools[@]}"; do
                        case $tool in
                            "node") sudo $package_manager install -y nodejs npm ;;
                            *) sudo $package_manager install -y "$tool" ;;
                        esac
                    done
                    ;;
                "brew")
                    for tool in "${missing_tools[@]}"; do
                        case $tool in
                            "node") brew install node ;;
                            *) brew install "$tool" ;;
                        esac
                    done
                    ;;
            esac
        else
            log "ERROR" "No package manager found. Please install missing tools manually."
            exit 1
        fi
    fi
    
    # Install inotify-tools for file monitoring
    if ! command -v inotifywait >/dev/null 2>&1; then
        log "INFO" "Installing inotify-tools for file monitoring..."
        case $package_manager in
            "apt-get") sudo apt-get install -y inotify-tools ;;
            "yum"|"dnf") sudo $package_manager install -y inotify-tools ;;
            "brew") brew install inotify-tools ;;
        esac
    fi
    
    log "SUCCESS" "All requirements satisfied"
}

# Setup Git configuration
setup_git() {
    log "INFO" "Setting up Git configuration..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log "INFO" "Initializing Git repository..."
        git init
    fi
    
    # Check remote configuration
    if ! git remote get-url origin > /dev/null 2>&1; then
        log "INFO" "Adding remote origin..."
        git remote add origin "$REPO_URL"
    else
        log "INFO" "Updating remote origin..."
        git remote set-url origin "$REPO_URL"
    fi
    
    # Configure user if not set
    if ! git config user.name > /dev/null 2>&1; then
        log "INFO" "Setting Git user name..."
        git config user.name "GitHub Live Update Bot"
    fi
    
    if ! git config user.email > /dev/null 2>&1; then
        log "INFO" "Setting Git user email..."
        git config user.email "live-update@github.com"
    fi
    
    # Set up Git hooks for additional automation
    if [ ! -d ".git/hooks" ]; then
        mkdir -p .git/hooks
    fi
    
    # Pre-commit hook for validation
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit validation hook

echo "🔍 Running pre-commit validation..."

# Run validations if scripts exist
if [ -f "validate_html.py" ]; then
    python3 validate_html.py || exit 1
fi

if [ -f "validate_css.py" ]; then
    python3 validate_css.py || exit 1
fi

if [ -f "script.js" ]; then
    node -c script.js || exit 1
fi

echo "✅ Pre-commit validation passed"
EOF
    
    chmod +x .git/hooks/pre-commit
    
    log "SUCCESS" "Git configuration completed"
}

# Make scripts executable
setup_scripts() {
    log "INFO" "Setting up automation scripts..."
    
    local scripts=("auto_deploy.sh" "watch_and_deploy.sh" "setup_live_github.sh")
    
    for script in "${scripts[@]}"; do
        if [ -f "$script" ]; then
            chmod +x "$script"
            log "SUCCESS" "Made $script executable"
        else
            log "WARN" "Script not found: $script"
        fi
    done
}

# Setup systemd service (optional)
setup_service() {
    if [ "$EUID" -eq 0 ]; then
        log "WARN" "Running as root. Skipping systemd service setup for security."
        return 0
    fi
    
    log "INFO" "Setting up systemd service for continuous monitoring..."
    
    # Update service file with current user and directory
    if [ -f "github-live-update.service" ]; then
        sed -i "s|User=%i|User=$CURRENT_USER|g" github-live-update.service
        sed -i "s|Group=%i|Group=$CURRENT_USER|g" github-live-update.service
        sed -i "s|WorkingDirectory=.*|WorkingDirectory=$CURRENT_DIR|g" github-live-update.service
        sed -i "s|ExecStart=.*|ExecStart=$CURRENT_DIR/watch_and_deploy.sh|g" github-live-update.service
        sed -i "s|ReadWritePaths=.*|ReadWritePaths=$CURRENT_DIR|g" github-live-update.service
        sed -i "s|Environment=HOME=.*|Environment=HOME=$HOME|g" github-live-update.service
        sed -i "s|Environment=USER=.*|Environment=USER=$CURRENT_USER|g" github-live-update.service
        
        # Install service for current user
        mkdir -p ~/.config/systemd/user
        cp github-live-update.service ~/.config/systemd/user/
        
        # Enable and start service
        systemctl --user daemon-reload
        systemctl --user enable github-live-update.service
        
        log "SUCCESS" "Systemd service configured"
        log "INFO" "Use 'systemctl --user start github-live-update' to start monitoring"
        log "INFO" "Use 'systemctl --user status github-live-update' to check status"
    else
        log "WARN" "Service file not found, skipping systemd setup"
    fi
}

# Create configuration file
create_config() {
    log "INFO" "Creating configuration file..."
    
    cat > .github-live-config << EOF
# GitHub Live Update Configuration
# Generated on $(date)

REPO_URL="$REPO_URL"
BRANCH="main"
WATCH_EXTENSIONS="html css js py md"
COOLDOWN_SECONDS=30
AUTO_VALIDATION=true
AUTO_BACKUP=true
LOG_RETENTION_DAYS=7

# GitHub Pages settings
PAGES_ENABLED=true
PAGES_BRANCH="main"
PAGES_PATH="/"

# Monitoring settings
CONTINUOUS_MONITORING=false
SERVICE_ENABLED=false

# Security settings
SECURITY_SCAN=true
VALIDATE_BEFORE_DEPLOY=true
EOF
    
    log "SUCCESS" "Configuration file created: .github-live-config"
}

# Create README for the automation system
create_documentation() {
    log "INFO" "Creating automation documentation..."
    
    cat > GITHUB_AUTOMATION_README.md << 'EOF'
# 🚀 GitHub Live Update Automation System

This directory contains a comprehensive automation system to ensure your GitHub repository is always live and up-to-date.

## 📁 Files Overview

### Core Scripts
- `auto_deploy.sh` - Main deployment automation script
- `watch_and_deploy.sh` - Continuous file monitoring and deployment
- `setup_live_github.sh` - Initial setup and configuration script

### GitHub Actions
- `.github/workflows/deploy.yml` - Automated CI/CD pipeline

### Configuration
- `.github-live-config` - Main configuration file
- `github-live-update.service` - Systemd service file

## 🚀 Quick Start

### 1. Initial Setup
```bash
./setup_live_github.sh
```

### 2. Manual Deployment
```bash
./auto_deploy.sh
```

### 3. Start Continuous Monitoring
```bash
./watch_and_deploy.sh
```

### 4. Run as System Service
```bash
systemctl --user start github-live-update
systemctl --user enable github-live-update
```

## 📊 Monitoring Commands

### Check Service Status
```bash
systemctl --user status github-live-update
```

### View Logs
```bash
journalctl --user -u github-live-update -f
```

### Stop Monitoring
```bash
systemctl --user stop github-live-update
```

## 🔧 Configuration Options

Edit `.github-live-config` to customize:
- Repository URL and branch
- File types to monitor
- Deployment cooldown period
- Validation settings
- Security options

## 🛡️ Security Features

- Pre-commit validation hooks
- Security scanning for common vulnerabilities
- Input validation and sanitization
- Secure systemd service configuration

## 📝 Logs

- `deployment.log` - Main deployment logs
- `watch_deploy.log` - Continuous monitoring logs
- System logs via journalctl

## 🔄 Automation Features

### Automatic Deployment
- Detects file changes in real-time
- Validates code before deployment
- Handles Git operations with retry logic
- Creates automatic backups

### GitHub Actions Integration
- Automated testing and validation
- Security scanning
- Multi-environment deployment
- Status notifications

### Monitoring & Alerting
- Continuous file watching
- Deployment status tracking
- Error handling and recovery
- Comprehensive logging

## 🚨 Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   chmod +x *.sh
   ```

2. **Git Authentication**
   - Set up SSH keys or personal access token
   - Configure Git credentials

3. **Service Won't Start**
   ```bash
   systemctl --user daemon-reload
   systemctl --user reset-failed github-live-update
   ```

4. **File Monitoring Issues**
   ```bash
   sudo apt-get install inotify-tools  # Ubuntu/Debian
   sudo yum install inotify-tools      # CentOS/RHEL
   ```

## 📞 Support

For issues or questions:
1. Check the logs: `tail -f deployment.log`
2. Verify service status: `./watch_and_deploy.sh --status`
3. Test deployment: `./auto_deploy.sh --validate`

## 🔄 Updates

To update the automation system:
```bash
git pull origin main
./setup_live_github.sh
```

---

**🎉 Your GitHub repository is now fully automated for live updates!**
EOF
    
    log "SUCCESS" "Documentation created: GITHUB_AUTOMATION_README.md"
}

# Test the setup
test_setup() {
    log "INFO" "Testing automation setup..."
    
    # Test Git operations
    if git status >/dev/null 2>&1; then
        log "SUCCESS" "Git operations working"
    else
        log "ERROR" "Git operations failed"
        return 1
    fi
    
    # Test script execution
    if [ -x "auto_deploy.sh" ]; then
        log "SUCCESS" "Deployment script is executable"
    else
        log "ERROR" "Deployment script not executable"
        return 1
    fi
    
    # Test validation scripts
    local validation_count=0
    if [ -f "validate_html.py" ]; then
        ((validation_count++))
    fi
    if [ -f "validate_css.py" ]; then
        ((validation_count++))
    fi
    
    if [ $validation_count -gt 0 ]; then
        log "SUCCESS" "Found $validation_count validation scripts"
    else
        log "WARN" "No validation scripts found"
    fi
    
    log "SUCCESS" "Setup test completed"
}

# Main setup process
main() {
    print_banner
    
    log "INFO" "Starting GitHub Live Update automation setup..."
    log "INFO" "Current directory: $CURRENT_DIR"
    log "INFO" "Current user: $CURRENT_USER"
    log "INFO" "Repository: $REPO_URL"
    
    # Confirm with user
    echo -e "${YELLOW}"
    read -p "Do you want to proceed with the setup? (y/N): " -n 1 -r
    echo -e "${NC}"
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "INFO" "Setup cancelled by user"
        exit 0
    fi
    
    # Run setup steps
    check_requirements
    setup_git
    setup_scripts
    create_config
    create_documentation
    setup_service
    test_setup
    
    # Final success message
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🎉 SETUP COMPLETE! 🎉                     ║"
    echo "║                                                              ║"
    echo "║  Your GitHub Live Update automation is now configured!       ║"
    echo "║                                                              ║"
    echo "║  Next Steps:                                                 ║"
    echo "║  1. Run: ./auto_deploy.sh (for immediate deployment)         ║"
    echo "║  2. Run: ./watch_and_deploy.sh (for continuous monitoring)   ║"
    echo "║  3. Run: systemctl --user start github-live-update          ║"
    echo "║                                                              ║"
    echo "║  📖 Read GITHUB_AUTOMATION_README.md for full documentation  ║"
    echo "║  📊 Monitor logs: tail -f deployment.log                     ║"
    echo "║  🔧 Configure: edit .github-live-config                      ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log "SUCCESS" "GitHub Live Update automation setup completed successfully!"
}

# Handle command line arguments
case "${1:-}" in
    "--help"|"-h")
        echo "GitHub Live Update Setup Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --test         Test current setup"
        echo "  --uninstall    Remove automation setup"
        echo ""
        exit 0
        ;;
    "--test")
        print_banner
        test_setup
        exit 0
        ;;
    "--uninstall")
        log "INFO" "Removing GitHub Live Update automation..."
        systemctl --user stop github-live-update 2>/dev/null || true
        systemctl --user disable github-live-update 2>/dev/null || true
        rm -f ~/.config/systemd/user/github-live-update.service
        rm -f .github-live-config
        log "SUCCESS" "Automation removed"
        exit 0
        ;;
    *)
        main
        ;;
esac 