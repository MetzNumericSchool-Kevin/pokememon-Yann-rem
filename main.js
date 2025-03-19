class Game {
  constructor() {
    this.grid = [];
    this.pokemons = [];
    this.captured = [];
    this.revealedCards = [];
    this.moves = 0;
    this.highScore = localStorage.getItem("highScore") || 99;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game();
  game.startGame();
});
