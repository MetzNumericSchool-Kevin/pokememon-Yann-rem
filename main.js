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
}

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game();
  game.startGame();
});
