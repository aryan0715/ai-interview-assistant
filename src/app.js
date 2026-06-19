const engine = window.InterviewEngine;

const state = {
  analysis: null,
  questions: [],
  answers: {},
  activeIndex: 0,
  report: null,
};

const els = {
  pageTitle: document.getElementById("pageTitle"),
  resumeFile: document.getElementById("resumeFile"),
  targetRole: document.getElementById("targetRole"),
  experienceLevel: document.getElementById("experienceLevel"),
  resumeText: document.getElementById("resumeText"),
  analyzeBtn: document.getElementById("analyzeBtn"),
  analysisOutput: document.getElementById("analysisOutput"),
  skillChips: document.getElementById("skillChips"),
  signalGrid: document.getElementById("signalGrid"),
  skillCount: document.getElementById("skillCount"),
  questionCount: document.getElementById("questionCount"),
  averageScore: document.getElementById("averageScore"),
  questionLimit: document.getElementById("questionLimit"),
  questionList: document.getElementById("questionList"),
  regenerateBtn: document.getElementById("regenerateBtn"),
  startInterviewBtn: document.getElementById("startInterviewBtn"),
  progressPill: document.getElementById("progressPill"),
  activeQuestionType: document.getElementById("activeQuestionType"),
  activeQuestionText: document.getElementById("activeQuestionText"),
  answerText: document.getElementById("answerText"),
  feedbackStrip: document.getElementById("feedbackStrip"),
  prevQuestionBtn: document.getElementById("prevQuestionBtn"),
  submitAnswerBtn: document.getElementById("submitAnswerBtn"),
  nextQuestionBtn: document.getElementById("nextQuestionBtn"),
  finishBtn: document.getElementById("finishBtn"),
  reportGrid: document.getElementById("reportGrid"),
  exportBtn: document.getElementById("exportBtn"),
  resetBtn: document.getElementById("resetBtn"),
};

const titles = {
  resume: "Build a personalized interview",
  questions: "Review generated questions",
  interview: "Practice your answers",
  report: "Track interview readiness",
};

function showStep(step) {
  document.querySelectorAll("[data-step-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.stepPanel === step);
  });
  document.querySelectorAll("[data-step-target]").forEach((button) => {
    button.classList.toggle("active", button.dataset.stepTarget === step);
  });
  els.pageTitle.textContent = titles[step] || titles.resume;
}

function renderAnalysis() {
  if (!state.analysis) return;

  els.analysisOutput.hidden = false;
  els.skillChips.innerHTML = "";
  const skills = state.analysis.skills.length ? state.analysis.skills : ["No exact skills detected"];
  skills.forEach((skill) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = skill;
    els.skillChips.appendChild(chip);
  });

  const signals = [
    ["Resume readiness", `${state.analysis.readiness}%`],
    ["Projects", state.analysis.signals.projectCount],
    ["Education signals", state.analysis.signals.educationCount],
    ["Achievements", state.analysis.signals.achievementCount],
    ["Soft skills", state.analysis.signals.softSkills.length],
    ["Contact details", state.analysis.signals.hasContactInfo ? "Found" : "Missing"],
  ];

  els.signalGrid.innerHTML = "";
  signals.forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "signal-item";
    item.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    els.signalGrid.appendChild(item);
  });

  updateMetrics();
}

function renderQuestions() {
  els.questionList.innerHTML = "";

  if (!state.questions.length) {
    els.questionList.innerHTML = `<div class="empty-state"><h4>No questions yet</h4><p>Analyze a resume to generate questions.</p></div>`;
    return;
  }

  state.questions.forEach((question, index) => {
    const article = document.createElement("article");
    article.className = "question-row";
    article.innerHTML = `
      <div class="row-index">${index + 1}</div>
      <div>
        <div class="question-meta">${question.type}${question.skill ? ` - ${question.skill}` : ""}</div>
        <h4>${question.question}</h4>
      </div>
    `;
    els.questionList.appendChild(article);
  });

  els.startInterviewBtn.disabled = false;
  els.regenerateBtn.disabled = false;
  updateMetrics();
}

function renderInterview() {
  const question = state.questions[state.activeIndex];
  const total = state.questions.length;
  els.progressPill.textContent = total ? `${state.activeIndex + 1} / ${total}` : "0 / 0";

  if (!question) {
    els.activeQuestionType.textContent = "Question";
    els.activeQuestionText.textContent = "Analyze a resume to begin.";
    els.answerText.value = "";
    return;
  }

  els.activeQuestionType.textContent = `${question.type} - ${question.skill}`;
  els.activeQuestionText.textContent = question.question;
  els.answerText.value = state.answers[question.id]?.answer || "";
  els.prevQuestionBtn.disabled = state.activeIndex === 0;
  els.nextQuestionBtn.disabled = state.activeIndex === total - 1;
  renderFeedback(question.id);
}

function renderFeedback(questionId) {
  const answer = state.answers[questionId];
  if (!answer?.evaluation) {
    els.feedbackStrip.hidden = true;
    els.feedbackStrip.innerHTML = "";
    return;
  }

  const evaluation = answer.evaluation;
  els.feedbackStrip.hidden = false;
  els.feedbackStrip.innerHTML = `
    <div class="score-badge">${evaluation.score}</div>
    <div>
      <strong>${scoreLabel(evaluation.score)}</strong>
      <p>${evaluation.feedback.positives[0]}</p>
      <p>${evaluation.feedback.improvements[0]}</p>
    </div>
  `;
}

function renderReport() {
  if (!state.report) {
    els.reportGrid.innerHTML = `<div class="empty-state"><h4>No report yet</h4><p>Submit at least one answer, then generate the report.</p></div>`;
    return;
  }

  const report = state.report;
  els.reportGrid.innerHTML = `
    <article class="report-card main-score">
      <span>Overall readiness</span>
      <strong>${report.average}</strong>
      <p>${report.readinessLabel}</p>
    </article>
    <article class="report-card">
      <span>Completion</span>
      <strong>${report.completed}/${report.total}</strong>
      <p>Answered questions</p>
    </article>
    <article class="report-card">
      <span>Technical</span>
      <strong>${report.technicalAverage}</strong>
      <p>Average technical score</p>
    </article>
    <article class="report-card">
      <span>HR</span>
      <strong>${report.hrAverage}</strong>
      <p>Average HR score</p>
    </article>
    <article class="report-card wide">
      <h4>Strengths</h4>
      <ul>${report.strengths.map((item) => `<li>${item}</li>`).join("")}</ul>
    </article>
    <article class="report-card wide">
      <h4>Improvement Areas</h4>
      <ul>${report.improvements.map((item) => `<li>${item}</li>`).join("")}</ul>
    </article>
  `;

  els.exportBtn.disabled = false;
  updateMetrics();
}

function updateMetrics() {
  els.skillCount.textContent = state.analysis?.skills.length || 0;
  els.questionCount.textContent = state.questions.length;
  const answered = Object.values(state.answers).filter((answer) => answer.evaluation);
  if (!answered.length) {
    els.averageScore.textContent = "--";
    return;
  }
  const average = Math.round(answered.reduce((sum, answer) => sum + answer.evaluation.score, 0) / answered.length);
  els.averageScore.textContent = average;
}

function analyzeResume() {
  const text = els.resumeText.value.trim();
  if (!text) {
    setTemporaryMessage(els.analyzeBtn, "Add resume text");
    return;
  }

  state.analysis = engine.analyzeResume(text, {
    role: els.targetRole.value.trim() || "Software Developer",
    level: els.experienceLevel.value,
  });
  state.questions = engine.generateQuestions(state.analysis, Number(els.questionLimit.value));
  state.answers = {};
  state.activeIndex = 0;
  state.report = null;

  renderAnalysis();
  renderQuestions();
  renderInterview();
  renderReport();
  showStep("questions");
}

function submitAnswer() {
  const question = state.questions[state.activeIndex];
  if (!question) return;

  const answer = els.answerText.value.trim();
  if (!answer) {
    setTemporaryMessage(els.submitAnswerBtn, "Type answer");
    return;
  }

  const evaluation = engine.evaluateAnswer(question, answer);
  state.answers[question.id] = { answer, evaluation };
  renderFeedback(question.id);
  updateMetrics();

  if (state.activeIndex < state.questions.length - 1) {
    setTimeout(() => {
      state.activeIndex += 1;
      renderInterview();
    }, 450);
  }
}

function generateReport() {
  state.report = engine.generateReport(state);
  renderReport();
  showStep("report");
}

function regenerateQuestions() {
  if (!state.analysis) return;
  state.questions = engine.generateQuestions(state.analysis, Number(els.questionLimit.value));
  state.answers = {};
  state.activeIndex = 0;
  state.report = null;
  renderQuestions();
  renderInterview();
  renderReport();
}

function exportReport() {
  if (!state.report) return;

  const payload = {
    analysis: state.analysis,
    questions: state.questions,
    answers: state.answers,
    report: state.report,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ai-interview-report.json";
  link.click();
  URL.revokeObjectURL(url);
}

function resetSession() {
  state.analysis = null;
  state.questions = [];
  state.answers = {};
  state.activeIndex = 0;
  state.report = null;
  els.resumeFile.value = "";
  els.resumeText.value = "";
  els.targetRole.value = "";
  els.analysisOutput.hidden = true;
  els.startInterviewBtn.disabled = true;
  els.regenerateBtn.disabled = true;
  els.exportBtn.disabled = true;
  renderQuestions();
  renderInterview();
  renderReport();
  updateMetrics();
  showStep("resume");
}

function setTemporaryMessage(button, message) {
  const original = button.textContent;
  button.textContent = message;
  button.disabled = true;
  setTimeout(() => {
    button.textContent = original;
    button.disabled = false;
  }, 1100);
}

function scoreLabel(score) {
  if (score >= 80) return "Excellent answer";
  if (score >= 65) return "Good answer";
  if (score >= 45) return "Developing answer";
  return "Needs more detail";
}

els.resumeFile.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  els.resumeText.value = text;
});

els.analyzeBtn.addEventListener("click", analyzeResume);
els.regenerateBtn.addEventListener("click", regenerateQuestions);
els.startInterviewBtn.addEventListener("click", () => {
  state.activeIndex = 0;
  renderInterview();
  showStep("interview");
});
els.submitAnswerBtn.addEventListener("click", submitAnswer);
els.prevQuestionBtn.addEventListener("click", () => {
  state.activeIndex = Math.max(0, state.activeIndex - 1);
  renderInterview();
});
els.nextQuestionBtn.addEventListener("click", () => {
  state.activeIndex = Math.min(state.questions.length - 1, state.activeIndex + 1);
  renderInterview();
});
els.finishBtn.addEventListener("click", generateReport);
els.exportBtn.addEventListener("click", exportReport);
els.resetBtn.addEventListener("click", resetSession);

document.querySelectorAll("[data-step-target]").forEach((button) => {
  button.addEventListener("click", () => showStep(button.dataset.stepTarget));
});

renderQuestions();
renderInterview();
renderReport();
updateMetrics();
