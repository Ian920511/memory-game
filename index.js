const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwait: "SecondCardAwait",
  CardMatchFailed: "CardMatchFailed",
  CardMatched: "CardMatched",
  GameFinished: "GameFinished",
};

const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png",
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png",
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png",
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png",
];

const view = {
  getCardElement(index) {
    return `
      <div data-index='${index}' class="card back">
      </div>`;
  },

  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];
    return `
        <p>${number}</p>
        <img src="${symbol}" alt="" />
        <p>${number}</p>
        `;
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },
  displayCards(indexs) {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexs
      .map((index) => this.getCardElement(index))
      .join("");
  },

  flipCards(...cards) {
    cards.map((card) => {
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }

      card.classList.add("back");
      card.innerHTML = null;
    });
  },

  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },

  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },

  renderTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} times`;
  },

  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      card.addEventListener("animationend", (event) => {
        event.target.classList.remove("wrong"), { once: true };
      });
    });
  },

  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
    <p>Complete!</p>
    <p>Score: ${modal.score}</p>
    <p>You've tried: ${modal.triedTimes} times</p>
    `;
    const header = document.querySelector("#header");
    header.before(div);
  },
};

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    console.log(number)
    return number;
  },
};

const modal = {
  revealedCards: [],

  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },

  score: 0,
  triedTimes: 0,
};

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },

  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return;
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        modal.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwait;
        break;
      case GAME_STATE.SecondCardAwait:
        view.renderTimes(++modal.triedTimes);
        view.flipCards(card);
        modal.revealedCards.push(card);

        if (modal.isRevealedCardsMatched()) {
          this.currentState = GAME_STATE.CardMatched;
          view.renderScore((modal.score += 10));
          view.pairCards(...modal.revealedCards);
          modal.revealedCards = [];
          if (modal.score === 260) {
            console.log("Game Over");
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          this.currentState = GAME_STATE.CardMatchFailed;
          view.appendWrongAnimation(...modal.revealedCards);
          setTimeout(this.resetCards, 500);
        }

        break;
    }

    console.log("this current state:", this.currentState);
    console.log(
      "revealedCards: ",
      modal.revealedCards.map((card) => card.dataset.index)
    );
  },

  resetCards() {
    view.flipCards(...modal.revealedCards);
    modal.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
};

controller.generateCards();

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card);
  });
});
