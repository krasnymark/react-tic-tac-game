import React from 'react';
import Select from 'react-select';
import './App.css';
import {Board} from './Board.js';
import {Utils} from './Utils.js'
import {patterns} from './Patterns.json'

const directions = [{x: 0, y: 1}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: -1}];
const levels = [
  { value: 'random', label: 'Random' },
  { value: 'stupid', label: 'Stupid' },
  { value: 'beginner', label: 'Beginner' }
]

class Square {
  constructor(props) {
    console.log(props);
    this.value = props ? props.value : null;
    this.winning = props ? props.winning : false;
    this.i = props.i;
    this.x = props.x;
    this.y = props.y;
  }
}

export class Game extends React.Component {
  constructor(props) {
    super(props);
    const dim = props.dim;
    const win = props.win;
    console.log('Game dim: ', dim, ' win: ', win);
    this.state = this.getInitialState(dim, win);
  }

  getInitialState(dim, win) {
    console.log('getInitialState dim: ' + dim, ' win: ', win);
    return {
      dim: dim,
      win: win,
      history: [
        {
          squares: Array(dim * dim).fill(null),
          winner: null
        }
      ],
      moves: [],
      chains: {x: [], o: []},
      stepNumber: 0,
      xIsNext: true,
      isAsc: true,
      xIsHuman: true,
      oIsHuman: false,
      playerLevel: levels[2]
    }
  }

  handleDimChange = (event) => {
    const dim = parseInt(event.target.value);
    this.setState(this.getInitialState(this.state.win, dim));
  }
  handleWinChange = (event) => {
    const win = parseInt(event.target.value);
    this.setState(this.getInitialState(win, this.state.dim));
  }
  handleLevelChange(playerLevel) {
    console.log('playerLevel: ', playerLevel);
    this.setState({
      playerLevel: playerLevel
    });
  }

  handleClick(x, y) {
    this.makeMove(x, y);
  }
  makeMove(x, y) {
    const moves = this.state.moves.slice(0, this.state.stepNumber);
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.map(a => a ? ({...a}) : null); // this.getCopyOfCurrentSquares(); // getCurrentSquares()
    const player = this.nextPlayer();
    const point = {x: x, y: y};
    const i = this.getSquareNumber(point);
    if (squares[i] || current.winner) { // the square was taken
      return;
    }
    squares[i] = new Square({i: i, x: x, y: y, value: player});
    const winner = this.calculateWinner(squares, x, y);
    const chains = this.updateChains(player, point, squares);
    let xChains;
    let oChains;
    if (this.state.xIsNext) {
      xChains = this.state.chains.x.slice();
      oChains = this.state.chains.o.concat(chains);
    } else {
      xChains = this.state.chains.x.concat(chains);
      oChains = this.state.chains.o.slice();
    }
    console.log('chains: ', xChains, oChains);
    this.setState({
      history: history.concat([
        {
          squares: squares,
          winner: winner,
        }
      ]),
      chains: {x: xChains, o: oChains},
      moves: moves.concat([ squares[i] ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    }, () => {
      this.afterSetStateFinished();
    });
  }

  afterSetStateFinished() {
    if ((this.state.xIsNext && !this.state.xIsHuman) || (!this.state.xIsNext && !this.state.oIsHuman)) {
      setTimeout(() => {
        const p = this.calculateNextMove();
        if (p) {
          this.makeMove(p.x, p.y);
        } else {
          console.log('no moves available'); // TODO - draw?
        }
      }, 10); // TODO - add transition
    }
  }

  toggleMoveOrder = () => {
    this.setState({isAsc: !this.state.isAsc});
  }
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  getCurrentSquares() {
    return this.state.history[this.state.stepNumber].squares.slice(); // shallow
  }
  getCopyOfCurrentSquares() {
    return this.state.history[this.state.stepNumber].squares.map(a => a ? ({...a}) : null); // deep
  }
  // Get square at point p
  getSquareNumber(p) {
    return p.y * this.state.dim + p.x;
  }
  getSquare(squares, p) {
    return this.isValid(p) ? squares[this.getSquareNumber(p)] : undefined;
  }
  getPlayer(square) {
    return square && square.value;
  }
  nextPlayer() {
    return this.state.xIsNext ? 'X' : 'O';;
  }
  // Is point within bounds
  isValid(p) {
    return 0 <= p.x && p.x < this.state.dim && 0 <= p.y && p.y < this.state.dim;
  }

  availableMoves() {
    return this.getCurrentSquares().filter(s => s == null);
  }
  calculateNextMove(squares) {
    if (this.availableMoves()) {
      switch(this.state.playerLevel.value) {
        case 'random':
          return this.randomMove();
        case 'stupid':
          return this.stupidMove();
        case 'beginner':
          return this.beginnerMove();
        default:
          return null;
      }
    } else {
      console.log('no moves available'); // TODO - draw?
    }
  }
  randomMove() {
    if (this.availableMoves()) {
      const squares = this.getCurrentSquares();
      while (true) {
        const p = {x: Utils.random(this.state.dim), y: Utils.random(this.state.dim)};
        if (this.getSquare(squares, p) == null) {
          return p;
        }
      }
    } else {
      return null;
    }
  }
  stupidMove() {
    const lastMove = this.getLastMove();
    console.log('lastMove: ', lastMove);
    const squares = this.getCurrentSquares();
    let move = this.findMoveInDir(squares, lastMove, directions);
    if (move == null) {
      move = this.findMoveInDir(squares, lastMove, directions.map(d => Utils.reverse(d)));
    }
    return move ? move : this.randomMove();
  }
  getLastMove() {
    return this.state.moves[this.state.stepNumber-1];
  }
  // find available move from point in direction
  findMoveInDir(squares, point, dir) {
    const dirs = Utils.shuffle(dir);
    const d = dirs.find(d => {
      const mm = Utils.move(point, d);
      return this.getSquare(squares, mm) == null;
    });
    return d ? Utils.move(point, d) : null;
  }
  beginnerMove() {
    const move = this.bestBeginnerMove();
    return move ? move : this.stupidMove();
  }
  // Best beginner move
  bestBeginnerMove() {
    const lastMove = this.getLastMove();
    let bestMove = {rank: -1};
    directions.forEach(dir => {
      const move = this.bestBeginnerMoveInDir(lastMove, dir);
      if (move.rank > bestMove.rank) {
        bestMove = move; // {point: move.point, rank: move.rank};
      }
    });
    return bestMove.point; // Utils.move(lastMove, bestMove.dir, bestMove.shift); // moves.reduce((m1,m2) => (m1.rank > m2.rank) ? m1 : m2) // return moves.sort((m1,m2) => m2.rank - m1.rank); // Highest first
  }
  // Defence - reacting only to the opponent's moves
  bestBeginnerMoveInDir(point, dir) {
    const line = this.patternInDir(point, dir);
    const pattern = patterns[line.pattern];
    console.log('pattern: ', line, ' => ', pattern);
    if (pattern) {
      let patternMove = pattern.move;
      if (pattern.altMove) {
        // Compare my team count around the move point - improves a bit, but need offence
        const cnt1 = this.getCountAround(Utils.move(point, dir, line.shift + pattern.move));
        const cnt2 = this.getCountAround(Utils.move(point, dir, line.shift + pattern.altMove));
        console.log('counts: ', cnt1, cnt2)
        patternMove = cnt2 > cnt1 ? pattern.altMove : patternMove;
      }
      return {point: Utils.move(point, dir, line.shift + patternMove), rank: pattern.rank};
    } else {
      return this.stupidMove();
    }
  }
  patternInDir(point, dir, player) {
    const squares = this.getCurrentSquares();
    const square = this.getSquare(squares, point);
    if (!player) player = this.getPlayer(square);
    const line = {
      pattern: '',
      shift: 1 - this.state.win, // index in relation to start, point => 0
      dir: dir
    };
    let start = Utils.move(point, dir, line.shift);
    for (let ix = 0; ix < this.state.win * 2 - 1; ix++) {
      const lineSquare = this.getSquare(squares, Utils.move(start, dir, ix));
      const squareValue = lineSquare === undefined ? -1 // off bounds
                        : lineSquare === null ? 0 // empty square
                        : lineSquare.value === player ? 1 : -1;  // opponent
      if (squareValue < 0) {
        // Mid-point is always 1
        if (ix < this.state.win) {
          line.pattern = ''; // start over after opponent or boundary
          line.shift = ix - this.state.win + 2; // shift from origin
        } else {
          break;
        }
      } else {
        line.pattern += squareValue ? '1' : '_';
      }
    }
    Utils.trim(line);
    line.pattern = '$' + line.pattern;
    return line;
  }
  getCountAround(point) {
    const player = this.nextPlayer();
    let count = 0;
    directions.forEach(dir => {
      if (this.getPlayer(this.getSquare(this.getCurrentSquares(), Utils.move(point, dir))) === player) count++;
      if (this.getPlayer(this.getSquare(this.getCurrentSquares(), Utils.move(point, Utils.reverse(dir)))) === player) count++;
    })
    return count;
  }

  updateChains(player, point, squares) {
    // Player just made a move - squares have been updated, but the player hasn't been switched
    // 1. Start only with chains attached to the last move
    const chains = [];
    directions.forEach(dir => chains.push(this.patternInDir(point, dir, player)));
    return chains;
  }
  calcChainsBruteForce(player, squares) {
    const playerSquares = squares.filter(s => s != null && s.value === player);
    console.log('playerSquares: ', playerSquares);
  }

  calculateWinner(squares, x, y) {
    // Starting from i check neighbor squares until hit other player or border. Repeat for 4 directions (0,1), (1,0), (1,1), (1,-1) - L-R, Up-Dn, D1, D2
    const start = {x: x, y: y};
    const player = this.getPlayer(this.getSquare(squares, start));
    let winner = null;
    directions.forEach(d => {
      let dd = d;
      let pp = start;
      let reversed = false;
      let count = 0;
      while (!winner) {
        const square = this.getSquare(squares, pp);
        if (this.isValid(pp) && this.getPlayer(square) === player) {
          count++;
          square.winning = true; // Mark as we go
          if (count === this.state.win) {
            winner = player;
            console.log('winner: ', winner);
          } else {
            pp = Utils.move(pp, dd);
          }
        } else if (!reversed) {
          dd = Utils.reverse(d);
          reversed = true; // Reverse just once
          pp = start;
          count--; // Not to double count start
        } else {
          count = 0;
          this.clearWinnerMark(squares);
          break;
        }
      }
    });
    return winner;
  }
  clearWinnerMark(squares) {
    squares.filter(s => s != null).forEach(s => s.winning = false);
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = current.winner;
    console.log('Game.render');
    const moves = history.map((step, move) => {
      console.log('move: ', move, ' state: ', step);
      const m = this.state.moves[move-1];
      const x = move ? m.x : -1;
      const y = move ? m.y : -1;
      const v = move ? m.value : null;
      const desc = move ?
        'Go to move #' + move + ' ' + v + '=>(' + x + ',' + y + ')' :
        'Go to game start';
      const currentMove = move === this.state.stepNumber ? 'current' : '';
      return (
        <li key={move}>
          <button className={currentMove} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    }).sort((m1,m2) => (m1.key - m2.key) * this.state.isAsc ? -1 : 1);
    const start = this.state.isAsc ? 0 : moves.length-1;
    const reversed = this.state.isAsc ? '' : 'reversed';
    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else if (this.state.stepNumber === this.state.dim * this.state.dim) {
      status = "It's a draw";
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <div className="game-settings">
            <label>Level:</label>
            <Select options={levels} defaultValue={this.state.playerLevel} onChange={(event) => this.handleLevelChange(event)} className="game-select"/>
            <label>Dim:</label>
            <input type="number" value={this.state.dim} onChange={this.handleDimChange} className="game-dim"></input>
            <label>Win:</label>
            <input type="number" value={this.state.win} onChange={this.handleWinChange} className="game-dim"></input>
          </div>
          <div className="game-board">
            <Board
              dim={this.state.dim}
              squares={current.squares}
              onClick={(x,y) => this.handleClick(x, y)}
            />
          </div>
        </div>
        <div className="game-info">
          <div>{status}</div>
          Moves:
          <button type="button" className="button" onClick={this.toggleMoveOrder}>{this.state.isAsc ? 'Asc' : 'Desc'}</button>
          <ol start={start} reversed={reversed}>{moves}</ol>
        </div>
      </div>
    );
  }
}

/* https://reactjs.org/tutorial/tutorial.html
    some ideas for improvements that you could make to the tic-tac-toe game which are listed in order of increasing difficulty:
    1. Display the location for each move in the format (col, row) in the move history list.
    2. Bold the currently selected item in the move list.
    3. Rewrite Board to use two loops to make the squares instead of hardcoding them.
    4. Add a toggle button that lets you sort the moves in either ascending or descending order.
    5. When someone wins, highlight the three squares that caused the win.
    6. When no one wins, display a message about the result being a draw.

    As usually I skip/miss stuff when I read - implemented #3,5,6 + variable dim before reading this.
*/