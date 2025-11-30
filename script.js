let currentIndex = 0;
let cards = [];
let listMode = false;

// Load seed + saved cards
async function loadCards() {
  const res = await fetch("cards.json");
  const data = await res.json();
  const saved = JSON.parse(localStorage.getItem("cards")) || [];
  cards = [...data, ...saved];
  cards.sort((a, b) => (a.id > b.id ? 1 : -1));
  currentIndex = 0;
  renderCard();
}

// Render single card
function renderCard() {
  const container = document.getElementById("cardContainer");
  container.style.overflowY = "hidden";
  const c = cards[currentIndex];

  container.innerHTML = `<div class="card" id="card">${c.situation}</div>`;
  requestAnimationFrame(() => {
    document.getElementById("card").classList.add("show");
  });
}

// Card animation
function animateCard(direction, next) {
  const card = document.querySelector(".card");
  if (!card) return;

  const out = direction === "left" ? "slide-out-left" : "slide-out-right";
  const inc = direction === "left" ? "slide-in-right" : "slide-in-left";

  // make sure the "show" transform doesn't override our slide-out
  card.classList.remove("show");
  void card.offsetWidth; // reflow so the next class transition applies
  card.classList.add(out); // start exit animation

  setTimeout(() => {
    next(); // render next card
    const newCard = document.querySelector(".card");
    newCard.classList.add(inc); // place off-screen
    void newCard.offsetWidth; // reflow
    newCard.classList.remove(inc); // animate in
    newCard.classList.add("show"); // settle to final state
  }, 250); // must match CSS duration
}

// Navigation
function nextCard() {
  animateCard("left", () => {
    currentIndex = (currentIndex + 1) % cards.length;
    renderCard();
  });
}
function prevCard() {
  animateCard("right", () => {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    renderCard();
  });
}
document.getElementById("undoBtn").onclick = prevCard;

// Swipe
let startX;
document.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX));
document.addEventListener("touchend", (e) => {
  const endX = e.changedTouches[0].clientX;
  const diff = endX - startX;
  if (diff > 60) showTodo();
  if (diff < -60) nextCard();
});

// To-do Panel
function showTodo() {
  const c = cards[currentIndex];
  const container = document.getElementById("cardContainer");
  container.innerHTML = `
    <div class="todo-panel">
      <div class="todo-header">
        <button class="nav-btn" onclick="renderCard()">← Back</button>
        <button class="nav-btn" onclick="goHome()">⌂ Home</button>
      </div>
      <div class="todo-body">
        <h3>${c.situation}</h3>
        <p>${c.todo}</p>
      </div>
    </div>`;
}
function goHome() {
  currentIndex = 0;
  renderCard();
}

// List View
function renderListView() {
  const container = document.getElementById("cardContainer");
  container.innerHTML = `
    <div class="list-view">
      ${cards
        .map(
          (c, i) => `
        <div class="list-item" onclick="openFromList(${i})">
          <span>${i + 1}. ${c.situation}</span><span>›</span>
        </div>`
        )
        .join("")}
    </div>`;
  container.style.overflowY = "auto";
}
function openFromList(i) {
  currentIndex = i;
  showTodo();
}

// Toggle List/Card
const toggleView = document.getElementById("toggleView");
const main = document.querySelector("main");

toggleView.addEventListener("click", () => {
  if (!listMode) {
    main.classList.add("list-mode");
    renderListView();
  } else {
    main.classList.remove("list-mode");
    renderCard();
  }
  listMode = !listMode;
});

// Add new card
const addBtn = document.getElementById("addBtn");
const modal = document.getElementById("addModal");
document.getElementById("cancelAdd").onclick = () =>
  modal.classList.add("hidden");
addBtn.onclick = () => modal.classList.remove("hidden");
document.getElementById("saveAdd").onclick = () => {
  const s = document.getElementById("newSituation").value.trim();
  const t = document.getElementById("newTodo").value.trim();
  if (!s || !t) return alert("Please fill both fields!");
  const newCard = { id: Date.now(), situation: s, todo: t, custom: true };
  cards.push(newCard);
  localStorage.setItem("cards", JSON.stringify(cards.filter((c) => c.custom)));
  modal.classList.add("hidden");
  document.getElementById("newSituation").value = "";
  document.getElementById("newTodo").value = "";
  currentIndex = cards.length - 1;
  renderCard();
};

// Load
loadCards();
