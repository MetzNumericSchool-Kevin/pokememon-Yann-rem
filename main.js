import { shuffleArray } from "./utils.js";

class Game {
  constructor() {
    this.grid = [];
    this.pokemons = [];
    this.captured = [];
    this.revealedCards = [];
    this.moves = 0;
    this.highScore = localStorage.getItem("highScore") || 99999;
  }

  async fetchPokemons() {
    try {
      const response = await fetch("./data/pokemon.json");
      this.pokemons = await response.json();
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      return [];
    }
  }

  initializeGrid(pairsCount = 6) {
    if (this.pokemons.length > 0) {
      const selectedPokemons = shuffleArray(this.pokemons).slice(0, pairsCount);
      const pokemonPairs = [...selectedPokemons, ...selectedPokemons];
      this.grid = shuffleArray(pokemonPairs);
    }
  }

  setupEvents() {
    document.querySelectorAll("#grille_de_jeu .box").forEach((box) => {
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
    const pokemon = this.grid[index];
    const pokemonImg = document.createElement("img");
    pokemonImg.src = pokemon.sprite;
    pokemonImg.classList.add("pokemon");
    bush.style.display = "none";
    box.appendChild(pokemonImg);
    this.revealedCards.push({ index, box, pokemonImg });

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

      this.updateCaptured(pokemon1);
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

  updateStats() {
    document.querySelector("#stat_nombre_de_coups").textContent = this.moves;
    document.querySelector("#stat_record_nombre_de_coups").textContent =
      this.highScore === 99999 ? "N/A" : this.highScore;

    if (this.captured.length === this.grid.length) {
      if (this.moves < this.highScore) {
        this.highScore = this.moves;
        localStorage.setItem("highScore", this.highScore);
        document.querySelector("#stat_record_nombre_de_coups").textContent =
          this.highScore;
      }

      document.querySelector("#rejouer").style.display = "block";
    }
  }

  updateCaptured(pokemon) {
    const list = document.querySelector(".liste_pokemons_captures");
    const pokemonImg = document.createElement("img");
    pokemonImg.src = pokemon.sprite;
    list.appendChild(pokemonImg);
  }

  saveGameState() {
    const gameState = {
      grid: this.grid,
      captured: this.captured,
      moves: this.moves,
      highScore: this.highScore,
    };

    localStorage.setItem("gameState", JSON.stringify(gameState));
  }

  loadGameState() {
    const savedState = localStorage.getItem("gameState");

    if (savedState) {
      const { grid, captured, moves, highScore } = JSON.parse(savedState);
      this.grid = grid;
      this.captured = captured;
      this.moves = moves;
      this.highScore = highScore;

      document.querySelectorAll("#grille_de_jeu .box").forEach((box, index) => {
        const bush = box.querySelector(".bush");

        if (this.captured.includes(String(index))) {
          const pokeballImg = document.createElement("img");
          pokeballImg.src = "./assets/pokeball.png";
          pokeballImg.classList.add("pokeball");
          bush.style.display = "none";
          box.appendChild(pokeballImg);
        } else {
          bush.style.display = "block";
        }
      });

      this.updateStats();
      this.updateCapturedFromState();
      return true;
    }

    return false;
  }

  updateCapturedFromState() {
    const list = document.querySelector(".liste_pokmeons_captures");
    list.innerHTML = "";
    const capturedSprites = [
      ...this.captured.map((index) => this.grid[index].sprite),
    ];

    capturedSprites.forEach((sprite) => {
      const pokemonImg = document.createElement("img");
      pokemon.src = sprite;
      list.appendChild(pokemonImg);
    });
  }

  restartGame() {
    this.moves = 0;
    this.captured = [];
    this.revealedCards = [];

    document.querySelectorAll("#grille_de_jeu .box").forEach((box) => {
      const bush = box.querySelector(".bush");
      const pokeball = box.querySelector(".pokeball");
      if (pokeball) pokeball.remove();
      bush.style.display = "block";
    });

    this.updateStats();
    document.querySelector("#rejouer").style.display = "none";
    document.querySelector("#liste_pokemons_captures").innerHTML = "";
  }

  setupDynamicGrid(pairsCount = 6) {
    const grid = document.querySelector("#grille_de_jeu");
    grid.innerHTML = "";
    const template = document.querySelector("#template-boite");
    const totalCards = pairsCount * 2;

    for (let i = 0; i < totalCards; i++) {
      const box = template.content.cloneNode(true);
      box.querySelector(".box").setAttribute("data-index", i);
      grid.appendChild(box);
    }

    this.initializeGrid(pairsCount);
    this.setupEvents();
  }

  async startGame() {
    await this.fetchPokemons();

    if (!this.loadGameState()) {
      this.setupDynamicGrid();
    }

    document
      .querySelector("#taille-grille")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        const pairsCount = parseInt(document.querySelector("#paires").value);
        this.setupDynamicGrid(pairsCount);
      });

    document
      .querySelector("#rejouer")
      .addEventListener("click", () => this.restartGame());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game();
  game.startGame();
});
