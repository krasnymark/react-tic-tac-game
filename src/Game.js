import React from 'react';
import './App.css';
import {Board} from './Board.js';

const directions = [{x: 0, y: 1}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: -1}];

class Square {
  constructor(props) {
    console.log(props);
    this.value = props ? props.value : null;
    this.winning = props ? props.winning : false;
    this.x = props.x;
    this.y = props.y;
  }
}

export class Game extends React.Component {
  constructor(props) {
    super(props);
    const win = props.win;
    const dim = props.dim;
    console.log('Game win: ', win, ' dim: ', dim);
    this.state = this.getInitialState(win, dim);
  }

  getInitialState(win, dim) {
    console.log('getInitialState dim: ' + dim, ' win: ', win);
    return {
      win: win,
      dim: dim,
      history: [
        {
          squares: Array(dim * dim).fill(null),
          winner: null
        }
      ],
      moves: [],
      stepNumber: 0,
      xIsNext: true,
      isAsc: true,
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
  
  handleClick(i, x, y) {
    const moves = this.state.moves.slice(0, this.state.stepNumber);
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.map(a => a ? ({...a}) : null); // .slice()
    const player = this.state.xIsNext ? 'X' : 'O';
    if (squares[i] || current.winner) { // the square was taken
      return;
    }
    squares[i] = new Square({value: player, x: x, y: y});
    const winner = this.calculateWinner(squares, x, y);
    this.setState({
      history: history.concat([
        {
          squares: squares,
          winner: winner
        }
      ]),
      moves: moves.concat([ squares[i] ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  toggleOrder = () => {
    this.setState({isAsc: !this.state.isAsc});
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  // Move from point p in direction d and return new point
  move(p, d) {
    return {x: p.x + d.x, y: p.y + d.y};
  }
  // Reverse direction
  reverse(d) {
    return {x: -d.x, y: -d.y};
  }
  // Get square at point p
  getSquare(squares, p) {
    const ix = p.y * this.state.dim + p.x;
    return squares[ix];
  }
  getPlayer(square) {
    return square && square.value;
  }
  // Is point within bounds
  isValid(p) {
    return 0 <= p.x && p.x < this.state.dim && 0 <= p.y && p.y < this.state.dim;
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
            pp = this.move(pp, dd);
          }
        } else if (!reversed) {
          dd = this.reverse(d);
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
      console.log(move);
      console.log(step);
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
          <label>Dim:</label>
          <input type="number" value={this.state.dim} onChange={this.handleDimChange} className="game-dim"></input>
          <label>Win:</label>
          <input type="number" value={this.state.win} onChange={this.handleWinChange} className="game-dim"></input>
          <Board
            dim={this.state.dim}
            squares={current.squares}
            onClick={(i,x,y) => this.handleClick(i, x, y)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          Moves:
          <button type="button" className="button" onClick={this.toggleOrder}>{this.state.isAsc ? 'Asc' : 'Desc'}</button>
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