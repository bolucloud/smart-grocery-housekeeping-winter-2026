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

## Dependency management with Poetry

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
## Running pytest in Poetry

From the repo root:

```bash
cd backend
poetry run pytest
```

## Troubleshooting virtual environment

See this GitHub issue thread for troubleshooting virtual environment issues with Poetry:
https://github.com/python-poetry/poetry/issues/6841

## Firebase setup (shared dev project) for local FastAPI testing

This guide sets up Firebase for local development against our **shared Firebase dev project**.
Each teammate will:
1) be added to the shared Firebase project,
2) generate their **own** service account key JSON,
3) set `GOOGLE_APPLICATION_CREDENTIALS` locally,
4) create a test Email/Password user in Firebase Auth (or use an existing one).

Do **not** commit or share service account private keys in the repo.
Each developer generates their own key and stores it locally (outside the repo or gitignored).

Note: we will want other auth methods than plain Email/Password, but this is a good first step to get started

---

### 0) Prereqs

- You have a Google account email you can use to access Firebase.
- The project owner (currently: **John**) has added your email to the Firebase project.

Firebase Console:
https://console.firebase.google.com/

---

### 1) Project owner steps (John)

#### 1.1 Create / choose the shared Firebase dev project
1. Go to: https://console.firebase.google.com/
2. Click **Add project** (or open the existing shared dev project).
3. Follow the prompts to create the project (Google Analytics is optional for local testing).

#### 1.2 Add teammates to the project
1. In Firebase Console, click **Project settings**
2. Open **Users and permissions**
3. Click **Add member**
4. Enter teammate Google account email(s)
5. Assign a role (recommended: **Editor** for dev)
6. Click **Add**

Teammates will not be able to generate their own keys unless they have sufficient permissions.

---

### 2) Teammate steps (everyone who wants to test)

#### 2.1 Accept the invite / confirm access
1. Open: https://console.firebase.google.com/
2. Confirm you can see the shared dev project in the project list.
3. Click into the shared dev project.

---

### 3) Enable Firebase Authentication (Email/Password)

This is typically done once per project. If it’s already enabled, you can skip.

1. In Firebase Console: **Build → Authentication**
2. Go to **Sign-in method**
3. Enable **Email/Password**
4. Click **Save**

Reference:
https://firebase.google.com/docs/auth/web/password-auth

---

### 4) Create a test user in Firebase Console (email/password)

Each developer can create a test user for local testing.

1. In **Build → Authentication**, go to the **Users** tab
2. Click **Add user**
3. Enter an email + password
4. Save

Reference:
https://support.google.com/firebase/answer/6400802?hl=en

---

### 5) Generate your own service account key (Admin SDK credentials)

Our FastAPI backend uses Firebase Admin SDK, which needs server-side credentials.

Each teammate should generate their **own** private key JSON from the shared dev project:

1. Firebase Console → **Project settings**
2. Go to **Service accounts**
3. Click **Generate new private key**
4. Download the JSON file

Reference:
https://firebase.google.com/docs/admin/setup

Treat this JSON like a password. Anyone with it can act as a privileged server against this Firebase project.

---

### 6) Store the JSON locally (DO NOT COMMIT)

Recommended local path:

- `$HOME/.config/smart-grocery-housekeeping/firebase-service-account.json`

If you instead add in the repo, ensure it is gitignored.

### 7) shell configuration

On macOS, the default shell is **zsh**.

Add the following line to `~/.zshrc`:

export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/smart-grocery-housekeeping/firebase-service-account.json"

Then reload your shell

If you're on a different OS, the gist is that you need to set an environment variable literally called
`GOOGLE_APPLICATION_CREDENTIALS`
with a value of the path that points to where you stored the JSON service account file.
