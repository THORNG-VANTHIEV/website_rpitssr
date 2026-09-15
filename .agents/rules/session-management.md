---
description: Rules for managing developer session lifecycle, taking breaks, and stopping running servers
globs: ["*"]
---

# Session Lifecycle & Process Management Rules

When interacting with the user, you MUST follow these operational guidelines regarding active processes:

1. **Taking a Break / Session Pauses**:
   - Whenever the user states that they are "taking a break", "stepping away", "done for today", or asks to pause/stop work, you MUST immediately terminate and stop all active project processes and dev servers:
     - Vite frontend dev server (port `5173`)
     - Laravel Artisan backend server (port `8000` or similar)
     - Any background node or php processes spawned during development
   - Use `lsof -i :5173 ; lsof -i :8000` to find PIDs and stop them cleanly.
   - Verify that all ports are freed before concluding your turn.

2. **Resuming Work**:
   - When the user returns and asks to continue or run the project, re-launch the necessary dev servers as required.
