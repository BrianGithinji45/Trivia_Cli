import chalk from "chalk";
import { select } from "@inquirer/prompts";
import { questions } from "./questions.js";

let score = 0;
let currentQuestionIndex = 0;
const TIME_PER_QUESTION = 15000;

export async function startQuiz() {
  console.log(chalk.blue.bold("\nWelcome to the Trivia CLI!\n"));
  console.log(chalk.yellow(`You have ${TIME_PER_QUESTION / 1000} seconds per question.\n`));
  
  score = 0;
  currentQuestionIndex = 0;

  for (const q of questions) {
    currentQuestionIndex++;
    await askQuestion(q);
  }

  endGame();
}

async function askQuestion(q) {
  console.log(chalk.cyan.bold(`\nQuestion ${currentQuestionIndex}/${questions.length}: ${q.question}`));

  const timerPromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve({ timeout: true });
    }, TIME_PER_QUESTION);
  });

  const answerPromise = select({
    message: "Select your answer:",
    choices: q.choices.map((choice) => ({ name: choice, value: choice })),
  }).then((answer) => ({ answer, timeout: false }));

  const result = await Promise.race([timerPromise, answerPromise]);

  if (result.timeout) {
    console.log(chalk.red("\nTime's up! Moving to next question."));
    console.log(chalk.yellow(`Correct answer was: ${q.answer}`));
  } else {
    checkAnswer(result.answer, q.answer);
  }
}

function checkAnswer(userAnswer, correctAnswer) {
  if (userAnswer === correctAnswer) {
    console.log(chalk.green("Correct!"));
    score++;
  } else {
    console.log(chalk.red(`Incorrect! Correct answer: ${correctAnswer}`));
  }
}

function endGame() {
  console.log(chalk.blue.bold("\n=== Game Over ===\n"));
  
  const total = questions.length;
  const percentage = Math.round((score / total) * 100);

  console.log(chalk.green(`Final Score: ${score}/${total} (${percentage}%)`));

  const performance = [
    { threshold: 80, message: "Excellent!" },
    { threshold: 60, message: "Good job!" },
    { threshold: 40, message: "Not bad, keep practicing!" },
    { threshold: 0, message: "Keep studying!" },
  ];

  const feedback = performance.filter((p) => percentage >= p.threshold)[0];
  console.log(chalk.yellow(feedback.message));

  const summary = questions.map((q, i) => `Q${i + 1}: ${q.question}`).join("\n");
  console.log(chalk.gray("\nQuestions covered:\n" + summary + "\n"));
}

export function getScore() {
  return score;
}