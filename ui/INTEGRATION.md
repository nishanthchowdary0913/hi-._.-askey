# Hi Askey UI integration

This UI calls `POST /api/chat`. The included `server.rag.ts` forwards each request to `rag_api.py`, which uses the College Bot's local Qdrant collection and Ollama models.

## Project layout

Copy the extracted UI files into a `ui` directory inside `D:\College Bot\CollegeBot`:

```text
CollegeBot/
  data/
  src/rag/
  ui/
    package.json
    server.rag.ts
    rag_api.py
    src/
```

From `ui`, install the UI dependencies and start it:

```powershell
cd "D:\College Bot\CollegeBot\ui"
npm install
npm run dev
```

The backend Python environment must exist at `D:\College Bot\CollegeBot\.venv312`. Set `PYTHON` if it is elsewhere.

The previous Gemini and hard-coded fallback server is not used. If Qdrant/Ollama is unavailable, the UI displays an error instead of inventing an answer.
