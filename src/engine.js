(function (root) {
  const SKILL_CATALOG = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "Spring Boot",
    "HTML",
    "CSS",
    "Tailwind",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Firebase",
    "AWS",
    "Azure",
    "Docker",
    "Kubernetes",
    "Git",
    "REST API",
    "GraphQL",
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "Data Analysis",
    "Pandas",
    "NumPy",
    "TensorFlow",
    "PyTorch",
    "Power BI",
    "Tableau",
    "Testing",
    "Jest",
    "Selenium",
    "Agile",
    "Scrum",
  ];

  const SOFT_SKILLS = [
    "communication",
    "leadership",
    "teamwork",
    "problem solving",
    "collaboration",
    "adaptability",
    "time management",
    "critical thinking",
  ];

  const FILLER_WORDS = new Set([
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "from",
    "using",
    "into",
    "have",
    "will",
    "your",
    "about",
    "their",
    "when",
    "where",
    "what",
    "which",
    "also",
  ]);

  function normalizeText(text) {
    return String(text || "")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function includesSkill(text, skill) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`, "i");
    return pattern.test(text);
  }

  function detectSkills(text) {
    const normalized = normalizeText(text);
    const skills = SKILL_CATALOG.filter((skill) => includesSkill(normalized, skill));

    if (/restful|api development/i.test(normalized) && !skills.includes("REST API")) {
      skills.push("REST API");
    }

    return skills;
  }

  function countMatches(text, words) {
    const lower = text.toLowerCase();
    return words.filter((word) => lower.includes(word)).length;
  }

  function extractSignals(text) {
    const normalized = normalizeText(text);
    const lower = normalized.toLowerCase();
    const lines = normalized.split("\n").filter(Boolean);
    const projectLines = lines.filter((line) => /project|built|developed|created|implemented/i.test(line));
    const educationLines = lines.filter((line) => /university|college|bachelor|master|b\.tech|degree|diploma/i.test(line));
    const experienceMatches = normalized.match(/(\d+)\+?\s*(years?|yrs?)/gi) || [];
    const achievementMatches = normalized.match(/\b(\d+%|\d+x|\d+\+|rank|award|certified|certificate)\b/gi) || [];
    const softSkillMatches = SOFT_SKILLS.filter((skill) => lower.includes(skill));

    return {
      lineCount: lines.length,
      projectCount: projectLines.length,
      educationCount: educationLines.length,
      experienceMentions: experienceMatches.length,
      achievementCount: achievementMatches.length,
      softSkills: softSkillMatches,
      hasContactInfo: /@|\+?\d[\d\s-]{7,}/.test(normalized),
    };
  }

  function analyzeResume(text, options = {}) {
    const normalized = normalizeText(text);
    const skills = detectSkills(normalized);
    const signals = extractSignals(normalized);

    return {
      resumeText: normalized,
      role: options.role || "Software Developer",
      level: options.level || "fresher",
      skills,
      signals,
      readiness: calculateResumeReadiness(skills, signals, normalized),
    };
  }

  function calculateResumeReadiness(skills, signals, text) {
    let score = 20;
    score += Math.min(skills.length * 5, 30);
    score += Math.min(signals.projectCount * 8, 20);
    score += Math.min(signals.achievementCount * 5, 15);
    score += signals.hasContactInfo ? 5 : 0;
    score += text.length > 900 ? 10 : 0;
    return Math.max(0, Math.min(100, score));
  }

  function questionForSkill(skill, role, level) {
    const intros = {
      fresher: `Explain how you have used ${skill} in a project or assignment.`,
      junior: `Describe a real problem you solved using ${skill}.`,
      mid: `How would you design and maintain a production feature using ${skill}?`,
      senior: `How do you evaluate trade-offs and guide a team when using ${skill}?`,
    };

    return {
      type: "Technical",
      skill,
      question: `${intros[level] || intros.fresher} Connect your answer to the ${role} role.`,
      expectedKeywords: keywordsFor(skill),
    };
  }

  function keywordsFor(skill) {
    const map = {
      JavaScript: ["async", "dom", "function", "event", "object"],
      TypeScript: ["type", "interface", "compile", "generic", "safety"],
      Python: ["function", "data", "library", "exception", "automation"],
      React: ["component", "state", "props", "hook", "render"],
      "Node.js": ["server", "api", "async", "request", "middleware"],
      SQL: ["query", "join", "index", "table", "database"],
      MongoDB: ["document", "collection", "query", "schema", "index"],
      "Machine Learning": ["model", "training", "data", "accuracy", "features"],
      NLP: ["text", "token", "model", "language", "classification"],
      Docker: ["container", "image", "deployment", "environment", "compose"],
      Git: ["branch", "commit", "merge", "version", "collaboration"],
      Testing: ["test", "case", "coverage", "bug", "quality"],
    };

    return map[skill] || skill.toLowerCase().split(/[\s.]+/).concat(["project", "problem", "result"]);
  }

  function generateQuestions(analysis, limit = 8) {
    const role = analysis.role || "Software Developer";
    const level = analysis.level || "fresher";
    const topSkills = analysis.skills.length ? analysis.skills.slice(0, Math.max(3, limit - 3)) : ["problem solving", "programming", "project work"];
    const technical = topSkills.map((skill) => questionForSkill(skill, role, level));
    const hr = [
      {
        type: "HR",
        skill: "self introduction",
        question: `Tell me about yourself and why you are interested in the ${role} role.`,
        expectedKeywords: ["background", "skill", "interest", "role", "goal"],
      },
      {
        type: "HR",
        skill: "project ownership",
        question: "Describe one project from your resume that you are most proud of. What was your contribution?",
        expectedKeywords: ["project", "contribution", "challenge", "result", "learned"],
      },
      {
        type: "HR",
        skill: "improvement",
        question: "What is one area you are currently improving, and what steps are you taking?",
        expectedKeywords: ["improve", "practice", "feedback", "learning", "plan"],
      },
      {
        type: "HR",
        skill: "teamwork",
        question: "Tell me about a time you worked with a team to solve a difficult problem.",
        expectedKeywords: ["team", "problem", "communication", "solution", "outcome"],
      },
    ];

    return technical.concat(hr).slice(0, Math.max(1, Number(limit) || 8)).map((item, index) => ({
      id: `q-${index + 1}`,
      ...item,
    }));
  }

  function tokenize(text) {
    return normalizeText(text)
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !FILLER_WORDS.has(word));
  }

  function evaluateAnswer(question, answer) {
    const cleanAnswer = normalizeText(answer);
    const words = tokenize(cleanAnswer);
    const expected = question.expectedKeywords || [];
    const matchedKeywords = expected.filter((keyword) => cleanAnswer.toLowerCase().includes(keyword.toLowerCase()));
    const hasExample = /\b(example|project|when|built|created|implemented|because|result|impact|learned)\b/i.test(cleanAnswer);
    const hasStructure = /\b(first|second|then|finally|because|therefore|result)\b/i.test(cleanAnswer);
    const hasConfidence = /\b(i built|i developed|i implemented|i solved|my role|i contributed|i designed)\b/i.test(cleanAnswer);

    const relevance = Math.min(100, Math.round((matchedKeywords.length / Math.max(expected.length, 1)) * 100));
    const completeness = Math.min(100, Math.round((words.length / 85) * 100));
    const clarity = Math.min(100, 45 + (hasStructure ? 25 : 0) + (words.length > 35 ? 20 : 0) + (cleanAnswer.length < 900 ? 10 : 0));
    const evidence = Math.min(100, 35 + (hasExample ? 35 : 0) + (hasConfidence ? 30 : 0));
    const score = Math.round(relevance * 0.3 + completeness * 0.25 + clarity * 0.2 + evidence * 0.25);

    return {
      score,
      relevance,
      completeness,
      clarity,
      evidence,
      matchedKeywords,
      feedback: buildFeedback(score, matchedKeywords, expected, hasExample, hasStructure, hasConfidence),
    };
  }

  function buildFeedback(score, matched, expected, hasExample, hasStructure, hasConfidence) {
    const positives = [];
    const improvements = [];

    if (score >= 75) positives.push("Strong answer with good role fit.");
    if (matched.length) positives.push(`Covered key terms: ${matched.join(", ")}.`);
    if (hasExample) positives.push("Included practical evidence or project context.");
    if (hasStructure) positives.push("Answer has a clear flow.");
    if (hasConfidence) positives.push("Shows personal ownership.");

    const missing = expected.filter((keyword) => !matched.includes(keyword)).slice(0, 3);
    if (missing.length) improvements.push(`Add more detail about ${missing.join(", ")}.`);
    if (!hasExample) improvements.push("Use a specific project example and explain the result.");
    if (!hasStructure) improvements.push("Structure the answer with situation, action, and outcome.");
    if (!hasConfidence) improvements.push("Make your contribution explicit using first-person ownership.");
    if (score < 45) improvements.push("Expand the answer with more technical detail and measurable impact.");

    return {
      positives: positives.length ? positives : ["Answer submitted successfully."],
      improvements: improvements.length ? improvements : ["Polish delivery and keep the answer concise."],
    };
  }

  function generateReport(session) {
    const answers = session.answers || {};
    const questions = session.questions || [];
    const evaluations = questions
      .map((question) => answers[question.id])
      .filter((answer) => answer && answer.evaluation)
      .map((answer) => answer.evaluation);

    const average = evaluations.length
      ? Math.round(evaluations.reduce((total, evaluation) => total + evaluation.score, 0) / evaluations.length)
      : 0;

    const technicalScores = questions
      .filter((question) => question.type === "Technical" && answers[question.id]?.evaluation)
      .map((question) => answers[question.id].evaluation.score);
    const hrScores = questions
      .filter((question) => question.type === "HR" && answers[question.id]?.evaluation)
      .map((question) => answers[question.id].evaluation.score);

    const strengths = [];
    const improvements = [];

    evaluations.forEach((evaluation) => {
      strengths.push(...evaluation.feedback.positives);
      improvements.push(...evaluation.feedback.improvements);
    });

    return {
      average,
      completed: evaluations.length,
      total: questions.length,
      readinessLabel: readinessLabel(average),
      technicalAverage: averageOf(technicalScores),
      hrAverage: averageOf(hrScores),
      strengths: unique(strengths).slice(0, 5),
      improvements: unique(improvements).slice(0, 5),
      generatedAt: new Date().toISOString(),
    };
  }

  function averageOf(values) {
    if (!values.length) return 0;
    return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
  }

  function unique(items) {
    return Array.from(new Set(items.filter(Boolean)));
  }

  function readinessLabel(score) {
    if (score >= 80) return "Interview ready";
    if (score >= 60) return "Almost ready";
    if (score >= 40) return "Needs focused practice";
    return "Needs more preparation";
  }

  const api = {
    analyzeResume,
    detectSkills,
    evaluateAnswer,
    generateQuestions,
    generateReport,
    normalizeText,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.InterviewEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
