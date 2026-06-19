# AI Interview Assistant

A local, dependency-free interview preparation app that analyzes a resume, generates personalized technical and HR questions, evaluates answers, and creates a performance report.

## Features

- Resume upload for `.txt` and `.md` files
- Resume paste area for text copied from PDF/DOCX resumes
- Skill, project, education, and experience detection
- Personalized technical and HR interview questions
- Answer scoring for relevance, completeness, clarity, examples, and confidence
- Final performance report with strengths and improvement areas
- JSON report export

## Run

Open `index.html` in a browser.

No install step is required.

## Optional Local Server

If you prefer serving the app locally:

```powershell
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Project Structure

```text
.
+-- index.html
+-- src
|   +-- app.js
|   +-- engine.js
|   +-- styles.css
+-- tests
    +-- engine.test.js
```

## Notes

This MVP uses a rule-based interview engine so it can run offline. The code is structured so a future backend or LLM API can replace the local question generation and evaluation functions without changing the main user flow.
