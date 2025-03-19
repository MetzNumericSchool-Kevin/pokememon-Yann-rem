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
}

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game();
  game.startGame();
});
