const assert = require("assert");
const engine = require("../src/engine");

const resume = `
Ananya Sharma
Frontend Developer
Built a React and Node.js project with REST API integration.
Skills: JavaScript, React, Node.js, SQL, Git, Testing
B.Tech Computer Science, Greenfield University
Improved page load by 35% and collaborated with a team using Agile.
`;

const analysis = engine.analyzeResume(resume, {
  role: "Frontend Developer",
  level: "junior",
});

assert(analysis.skills.includes("JavaScript"), "detects JavaScript");
assert(analysis.skills.includes("React"), "detects React");
assert(analysis.signals.projectCount >= 1, "detects project signals");
assert(analysis.readiness > 50, "calculates resume readiness");

const questions = engine.generateQuestions(analysis, 6);
assert.strictEqual(questions.length, 6, "generates requested question count");
assert(questions.some((question) => question.type === "Technical"), "includes technical questions");
assert(questions.some((question) => question.type === "HR"), "includes HR questions");

const answer = `
I built a React project where my role was to create reusable components,
manage state with hooks, and connect screens to a REST API. The result was
a faster workflow for users and I learned how to structure components clearly.
`;

const evaluation = engine.evaluateAnswer(questions[0], answer);
assert(evaluation.score > 40, "scores a detailed answer");
assert(evaluation.feedback.positives.length > 0, "returns positives");
assert(evaluation.feedback.improvements.length > 0, "returns improvements");

const report = engine.generateReport({
  questions,
  answers: {
    [questions[0].id]: { answer, evaluation },
  },
});

assert.strictEqual(report.completed, 1, "counts completed answers");
assert.strictEqual(report.total, questions.length, "counts total questions");
assert(report.average > 0, "calculates report average");

console.log("All engine tests passed.");
