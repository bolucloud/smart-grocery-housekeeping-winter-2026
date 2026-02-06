# Backend Setup

This backend uses **Poetry** for dependency management and **pipx** to install Poetry as a global CLI tool.

## Prerequisites

- Python **3.11 – 3.14**
- Git

### Note about Python version

The supported Python version range is defined in `pyproject.toml`.  
When you run `poetry install`, Poetry will look for a local Python interpreter that satisfies this range and
create the virtual environment using it. If no compatible version is found, Poetry will fail.

This constraint can be adjusted later if the team decides to target a narrower or different version range (or specific version).

## One-time setup (per machine)

### 1. Install pipx

#### macOS (Homebrew)
```bash
brew install pipx
pipx ensurepath
```

#### Windows (PowerShell)
```powershell
py -m pip install --user pipx
py -m pipx ensurepath
```

Restart your terminal/shell.

### 2. Install Poetry
```bash
pipx install poetry
poetry --version
```

### 3. Navigate to backend directory
Clone the GitHub repo if you haven't already.
```bash
cd backend
```

### 4. Install dependencies (will create virtual environment)
The following command installs all backend dependencies and creates a virtual environment if one does not already exist.

Optionally, you may configure Poetry to keep the virtual environment inside the project directory
```bash
poetry config virtualenvs.in-project true
```

Now install dependencies
```bash
poetry install
```

## Run server
```bash
poetry run uvicorn main:app --reload
```

## Dependency management

All backend dependencies should be managed using **Poetry**.

- Add dependencies with `poetry add <package>`
- Remove dependencies with `poetry remove <package>`
- Install existing dependencies with `poetry install`

Do **not** use `pip install` directly for this project, as it can desynchronize the environment from `poetry.lock`.


## Image Recognition (OpenAI) — Returns JSON

This backend supports recognizing a grocery item from an uploaded image and returning a structured JSON response (item name, category, and confidence score.

### What it does
- Accepts an image upload (jpg/png)
- Sends the image to OpenAI for recognition
- Returns a JSON object describing the item (for use in the mobile/web app)