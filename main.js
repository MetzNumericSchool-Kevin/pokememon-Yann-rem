import { shuffleArray } from "../../Users/remyy/OneDrive/Pièces jointes/pokemon/utils";

class Game {
  constructor() {
    this.grid = [];
    this.pokemons = [];
    this.captured = [];
    this.revealedCards = [];
    this.moves = 0;
    this.highScore = localStorage.getItem("highScore") || 99;
  }

  async fetchPokemons() {
    try {
      const response = fetch("./data/pokemons.json");
      this.pokemons = (await response).json();
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      return [];
    }
  }

  initializedGrid(pairsCount = 6) {
    if (this.pokemons > 0) {
      const selectedPokemons = shuffleArray(this.pokemons).slice(0, pairsCount);
      const pokemonPairs = [...selectedPokemons, ...selectedPokemons];
      this.grid = shuffleArray(pokemonPairs);
    }
  }

  setupEvents() {
    document.querySelectorAll("#grille_de_jeu .box").forEach((box, index) => {
      box.setAttribute("data-index", index);
      box.addEventListener("click", () => {
        const index = box.getAttribute("data-index");
        this.revealPokemon(index, box);
      });
    });
  }

  revealPokemon(index, box) {
    if (
      this.revealedCards.length >= 2 ||
      this.captured.includes(index) ||
      this.revealedCards.some((card) => card.index) === index
    ) {
      return;
    }

    const bush = box.querySelector(".bush");
    const pokmeon = this.grid[index];
    const pokmemonImg = document.createElement("img");
    pokmemonImg.src = pokmeon.sprite;
    pokmemonImg.classList.add("pokemon");
    bush.style.display = "none";
    box.appendchild(pokmemonImg);
    this.revealedCards.push({ index, box, pokmemonImg });

    if (this.revealedCards.length === 2) {
      this.moves++;
      this.checkMatch();
    }
  }

  checkMatch() {
    const [card1, card2] = this.revealedCards;
    const pokemon1 = this.grid[card1.index];
    const pokemon2 = this.grid[card2.index];

    if (pokemon1.name === pokemon2.name) {
      this.captured.push(card1.index, card2.index);

      [card1, card2].forEach((card) => {
        const pokeballImg = document.createElement("img");
        pokeballImg.src = "./assets/pokeball.png";
        pokeballImg.classList.add("pokeball");
        card.pokemonImg.remove();
        card.box.appendChild(pokeballImg);
      });

      this.revealedCards = [];
    } else {
      setTimeout(() => {
        card1.pokemonImg.remove();
        card2.pokemonImg.remove();
        card1.box.querySelector(".bush").style.display = "block";
        card2.box.querySelector(".bush").style.display = "block";
        this.revealedCards = [];
      }, 2000);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game();
  game.startGame();
});
