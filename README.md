# Cluster Manager

## Overview

Cluster Manager is a web application for managing user clusters. Users can log in, view, sort, search, and (if authorized) delete their clusters.

---

## How the App Works

- **Login:**
  Log in using one of the username and password combinations found in `mock_data/passwords.txt`.

- **User Clusters:**
  After logging in, you will see the clusters associated with your user account.

- **Cluster Selection & Deletion:**
  Select clusters by clicking the checkbox in the right-most column, then click the trash can icon to delete.
  Deletion is only enabled for clusters that belong to the logged-in user.

- **View All Users:**
  Use the dropdown next to your username to select `ALL USERS` and view clusters for every user.
  Cluster deletion is disabled in this view.

- **Sorting & Searching:**
  - Sort clusters by ascending/descending order using the dropdown next to the ID column.
  - Search for clusters by ID or username using the search box.

- **Navigation:**
  - Click your username in the upper right to log out.
  - Click `CM` in the upper left to return to your own cluster view page.

---

## Setup Instructions

1. Clone the repository.
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install backend dependencies:
    -Navigate to the `backend` directory:
   ```bash
   pip install -r requirements.txt
   ```
4. Install frontend dependencies:
   - Navigate to the `frontend` directory:
   ```bash
   npm install
   ```
5. Open two terminal windows/tabs:
   - In the first terminal, navigate to the `backend/app` directory
   - Set the JWT secret environment variable:
   ```bash
   export JWT_SECRET='your_secret_key'
   ```
   - Start the backend server:
   ```bash
   python app.py
   ```
   - In the second terminal, navigate to the `frontend` directory and start the frontend server:
   ```bash
   npm run dev
   ```
6. Click the provided frontend localhost URL in your browser to access the application.

---

## Running Unit Tests

Make sure your virtual environment is activated and dependencies are installed.

To run the unit tests with `pytest`, first navigate to the `backend` directory, then execute:

```bash
pytest
```
---
## Code Quality

To ensure code quality, run `flake8` in the `backend` directory:

```bash
flake8 .
black .
```
---


