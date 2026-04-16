const questions = [
    {
        question: "What is the most effective way to reduce plastic waste?",
        options: ["Use reusable bags", "Recycle plastic", "Buy less plastic", "Use reusable bags and containers"],
        answer: 3
    },
    {
        question: "Which of these saves the most energy?",
        options: ["Turning off lights", "Unplugging devices", "Using LED bulbs", "All of the above"],
        answer: 3
    },
    {
        question: "What should you do with food scraps?",
        options: ["Throw in trash", "Compost them", "Flush down drain", "Burn them"],
        answer: 1
    },
    {
        question: "Which transportation is most eco-friendly?",
        options: ["Driving alone", "Carpooling", "Biking or walking", "Flying"],
        answer: 2
    },
    {
        question: "How can you reduce water usage?",
        options: ["Take shorter showers", "Fix leaks", "Use water-efficient appliances", "All of the above"],
        answer: 3
    }
];

let currentQuestion = 0;
let score = 0;
let selectedOption = null;

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const resultEl = document.getElementById('result');
const scoreText = document.getElementById('score-text');
const restartBtn = document.getElementById('restart-quiz');

function loadQuestion() {
    const q = questions[currentQuestion];
    questionEl.textContent = q.question;
    optionsEl.innerHTML = '';
    selectedOption = null;
    q.options.forEach((option, index) => {
        const div = document.createElement('div');
        div.className = 'option';
        div.textContent = option;
        div.addEventListener('click', () => selectOption(index, div));
        optionsEl.appendChild(div);
    });
    nextBtn.style.display = 'none';
}

function selectOption(index, el) {
    if (selectedOption !== null) return;
    selectedOption = index;
    el.classList.add('selected');
    nextBtn.style.display = 'block';
}

nextBtn.addEventListener('click', () => {
    if (selectedOption === questions[currentQuestion].answer) {
        score++;
    }
    currentQuestion++;
    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
});

function showResult() {
    document.getElementById('question-container').style.display = 'none';
    nextBtn.style.display = 'none';
    resultEl.style.display = 'block';
    scoreText.textContent = `You scored ${score} out of ${questions.length}!`;
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('add-points', score * 10);
}

restartBtn.addEventListener('click', () => {
    currentQuestion = 0;
    score = 0;
    resultEl.style.display = 'none';
    document.getElementById('question-container').style.display = 'block';
    loadQuestion();
});

loadQuestion();
