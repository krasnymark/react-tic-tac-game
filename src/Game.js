import React from 'react';
import './App.css';
import {Board} from './Board.js';

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
    const dim = props.dim;
    console.log('dim: ' + dim);
    this.state = this.getInitialState(dim);
  }

  getInitialState(dim) {
    console.log('getInitialState dim: ' + dim);
    return {
      dim: dim,
      lines: this.getWinningLines(dim),
      history: [
        {
          squares: Array(dim * dim).fill(null)
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
    this.setState(this.getInitialState(dim));
  }

  handleClick(i, x, y) {
    const moves = this.state.moves.slice(0, this.state.stepNumber);
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (this.calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = new Square({value: this.state.xIsNext ? 'X' : 'O', x: x, y: y});
    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      moves: moves.concat([ squares[i] ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }
  toggleOrder = () => {
    this.setState({isAsc: !this.state.isAsc});
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  getWinningLines(dim) {
    // Define lines dynamically and cache
    console.log('initWinningLines');
    const lines = [];
    const numR = [...Array(dim).keys()];
    numR.forEach(x => lines.push(numR.map(y => x * dim + y))); // h
    numR.forEach(x => lines.push(numR.map(y => x + y * dim))); // v
    let d = 0;
    const d1 = [];
    numR.forEach(x => {d1.push(d); d += dim + 1;});
    lines.push(d1);
    d = dim - 1;
    const d2 = [];
    numR.forEach(x => {d2.push(d); d += dim - 1;});
    lines.push(d2);
    console.log(lines);
    return lines;
  }

  calculateWinner(squares) {
    squares.forEach(s => {if (s) s.winning = false;});
    for (let i = 0; i < this.state.lines.length; i++) {
      const line = this.state.lines[i];
      let xCount = 0;
      let oCount = 0;
      line.forEach(i => {
        if (squares[i] && squares[i].value === 'X') xCount++;
        if (squares[i] && squares[i].value === 'O') oCount++;
    })
    const winner = xCount === this.state.dim ? 'X' :
                   oCount === this.state.dim ? 'O' : null;
      if (winner) {
        line.forEach(i => squares[i].winning = true);
        return winner;
      }
    }
    return null;
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = this.calculateWinner(current.squares);
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