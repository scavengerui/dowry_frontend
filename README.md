# Dowry Calculator – Frontend

Simple static frontend for the Dowry Calculator backend.

## What it does

- Lets you **upload a face photo**
- Sends it to the backend route **`POST /calculate`** as `multipart/form-data` with the field name **`face`**
- Shows the AI's **playful dowry reply** or any error message

## Files

- `index.html` – main page and UI
- `style.css` – modern, minimal styling
- `script.js` – handles image preview, form submit and calling the backend

## Running locally

1. Start your existing backend (the one exposing `POST /calculate`).
2. From this folder, serve the static files with any simple HTTP server, for example:
   - Using VS Code / editor live server plugin, or
   - Using Node:

     ```bash
     npx serve .
     ```

3. Open the printed URL (e.g. `http://localhost:3000` or `http://localhost:5173`) in your browser.

If your backend is **not** on `http://localhost:3000`, update `BACKEND_BASE_URL` at the top of `script.js`.


