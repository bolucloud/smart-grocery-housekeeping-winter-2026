#!/bin/bash

# Exit on error, undefined variables, and pipe failures
set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log_error "Please don't run this script as root"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get the actual user (even when running with sudo)
REAL_USER=${SUDO_USER:-$USER}
REAL_HOME=$(eval echo ~$REAL_USER)

log_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install basic dependencies
log_info "Installing basic dependencies..."
sudo apt install -y \
    ca-certificates \
    curl \
    unzip \
    libpq-dev \
    libssl-dev \
    libffi-dev \
    libcurl4-openssl-dev \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    postgresql \
    postgresql-contrib \
    redis-server \
    nginx \
    software-properties-common \
    apt-transport-https \
    wget \
    gnupg \
    lsb-release \
    python3-pip \
    python3-venv \
    python3-full \
    pipx

# Install Python packages using pipx for CLI tools
log_info "Installing Python development tools with pipx..."
pipx ensurepath
export PATH="$PATH:$REAL_HOME/.local/bin"

# Install Python packages in a virtual environment
log_info "Creating Python virtual environment for project dependencies..."
mkdir -p "$REAL_HOME/venvs"
python3 -m venv "$REAL_HOME/venvs/project-env"

# Activate and install packages in the virtual environment
source "$REAL_HOME/venvs/project-env/bin/activate"
pip install --upgrade pip
pip install \
    fastapi \
    pydantic \
    sqlalchemy \
    alembic \
    psycopg2-binary \
    asyncpg \
    httpx \
    pytest \
    pytest-asyncio \
    pytest-cov \
    black \
    isort \
    mypy
deactivate

# Install Python CLI tools with pipx (optional - these are globally available)
log_info "Installing Python CLI tools with pipx..."
pipx install black
pipx install isort
pipx install mypy
pipx install pytest
pipx install poetry

# Install AWS CLI tools
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install


# Install Docker
log_info "Installing Docker..."
# Remove old versions if they exist
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources
UBUNTU_CODENAME=$(lsb_release -cs)
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null <<EOF
deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME} stable
EOF

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $REAL_USER
log_warn "You'll need to log out and back in for docker group changes to take effect"

# Enable and start Docker services
log_info "Enabling and starting Docker services..."
sudo systemctl enable docker
sudo systemctl enable containerd
sudo systemctl start docker
sudo systemctl start containerd

# Install NVM and Node.js
log_info "Installing NVM and Node.js..."
if [ ! -d "$REAL_HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
fi

# Load NVM
export NVM_DIR="$REAL_HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install latest LTS version of Node.js
nvm install --lts
nvm alias default 'lts/*'

# Install Terraform
log_info "Installing Terraform..."
# Remove old repository if exists
sudo rm -f /etc/apt/sources.list.d/hashicorp.list

wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg

UBUNTU_CODENAME=$(lsb_release -cs)
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com ${UBUNTU_CODENAME} main" | sudo tee /etc/apt/sources.list.d/hashicorp.list

sudo apt update && sudo apt install -y terraform nodejs

# Install GitHub Actions Runner
log_info "Installing GitHub Actions Runner..."

# Create runner directory
RUNNER_DIR="$REAL_HOME/actions-runner"
mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

# Download and verify runner
RUNNER_VERSION="2.331.0"
RUNNER_CHECKSUM="5fcc01bd546ba5c3f1291c2803658ebd3cedb3836489eda3be357d41bfcf28a7"

if [ ! -f "actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" ]; then
    curl -o "actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" -L "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
fi

# Verify checksum
echo "${RUNNER_CHECKSUM}  actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" | shasum -a 256 -c

# Extract runner
tar xzf "./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"

# Configure runner (non-interactive)
log_info "Configuring GitHub Actions Runner..."
./config.sh --unattended \
    --url "https://github.com/bolucloud/smart-grocery-housekeeping-winter-2026" \
    --token "AWLZ45YIHRDMU5KCZIVHOQLJSDQAI" \
    --name "$(hostname)-runner" \
    --work "_work" \
    --labels "ubuntu,self-hosted" \
    --replace

# Create systemd service for GitHub Actions Runner
log_info "Creating systemd service for GitHub Actions Runner..."

sudo tee /etc/systemd/system/actions.runner.bolucloud-smart-grocery-housekeeping-winter-2026.service > /dev/null <<EOF
[Unit]
Description=GitHub Actions Runner (bolucloud/smart-grocery-housekeeping-winter-2026)
After=network.target

[Service]
Type=simple
User=$REAL_USER
WorkingDirectory=$RUNNER_DIR
ExecStart=$RUNNER_DIR/run.sh
ExecStop=$RUNNER_DIR/config.sh --remove --token AWLZ45YIHRDMU5KCZIVHOQLJSDQAI
Restart=always
RestartSec=10
Environment="RUNNER_ALLOW_RUNASROOT=1"

[Install]
WantedBy=multi-user.target
EOF

# Set proper permissions
sudo chown -R $REAL_USER:$REAL_USER "$RUNNER_DIR"
sudo chmod +x "$RUNNER_DIR/run.sh"

# Enable and start the runner service
log_info "Enabling and starting GitHub Actions Runner service..."
sudo systemctl daemon-reload
sudo systemctl enable actions.runner.bolucloud-smart-grocery-housekeeping-winter-2026.service
sudo systemctl start actions.runner.bolucloud-smart-grocery-housekeeping-winter-2026.service

# Configure and start other services
log_info "Configuring and starting services..."

# PostgreSQL
if systemctl list-unit-files | grep -q postgresql; then
    sudo systemctl enable postgresql
    sudo systemctl start postgresql
    log_info "PostgreSQL service started"
else
    log_warn "PostgreSQL service not found"
fi

# Redis
if systemctl list-unit-files | grep -q redis-server; then
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
    log_info "Redis service started"
else
    log_warn "Redis service not found"
fi

# Nginx
if systemctl list-unit-files | grep -q nginx; then
    sudo systemctl enable nginx
    sudo systemctl start nginx
    log_info "Nginx service started"
else
    log_warn "Nginx service not found"
fi

# Create activation script for the virtual environment
log_info "Creating virtual environment activation script..."
cat > "$REAL_HOME/activate-project-env.sh" <<EOF
#!/bin/bash
source $REAL_HOME/venvs/project-env/bin/activate
echo "Python virtual environment activated. Run 'deactivate' to exit."
EOF

chmod +x "$REAL_HOME/activate-project-env.sh"

# Verify installations
log_info "Verifying installations..."

echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker compose version)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Terraform version: $(terraform --version)"

# Check service status
log_info "Service status:"
echo "Docker: $(systemctl is-active docker)"
echo "PostgreSQL: $(systemctl is-active postgresql)"
echo "Redis: $(systemctl is-active redis-server)"
echo "Nginx: $(systemctl is-active nginx)"
echo "GitHub Runner: $(systemctl is-active actions.runner.bolucloud-smart-grocery-housekeeping-winter-2026.service)"

# Display runner status
log_info "GitHub Actions Runner status:"
cd "$RUNNER_DIR"
./svc.sh status || log_warn "Runner service not running"

# Display information about Python environment
log_info "Python environment information:"
echo "Virtual environment created at: $REAL_HOME/venvs/project-env"
echo "To activate: source $REAL_HOME/venvs/project-env/bin/activate"
echo "Or use: $REAL_HOME/activate-project-env.sh"
echo ""
echo "Python CLI tools installed with pipx (available globally):"
pipx list

# Display group change reminder
log_warn "========================================"
log_warn "IMPORTANT: You need to log out and back in"
log_warn "or run 'newgrp docker' to use docker without sudo"
log_warn "========================================"

log_info "Installation completed successfully!"