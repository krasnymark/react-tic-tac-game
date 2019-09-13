import React from 'react';

import './App.css';

function Square(props) {
    const type = 'square' + (props.winning ? ' winning' : '');
    return (
      <button className={type} onClick={props.onClick}>
        {props.value}
      </button>
    );
  }
  
export class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {dim: props.dim};
    console.log('Board dim: ' + this.state.dim);
  }
  renderSquare(i, x, y) {
    if (this.props.squares[i])
      console.log('renderSquare: ' + i + ' - ' + JSON.stringify(this.props.squares[i]));
    const key = JSON.stringify({x: x, y: y});
    return (
      <Square
        key={key}
        value={this.props.squares[i] ? this.props.squares[i].value : null}
        winning={this.props.squares[i] ? this.props.squares[i].winning : false}
        onClick={() => this.props.onClick(i, x, y)}
      />
    );
  }
// Deprecated: componentWillReceiveProps(props) { this.setState({dim: props.dim}); }
  static getDerivedStateFromProps(props, state) {
    return state.dim !== props.dim ? {dim: props.dim} : null;
  }

  render() {
    const numR = [...Array(this.state.dim).keys()];
    let n = 0;
    console.log('Board.render');
    return (
      <div className="board">
      {
          numR.map(x => 
            <div key={x} className="board-row">
            {
                numR.map(y => this.renderSquare(n++, y, x))
            }
            </div>
          )
      }
      </div>
    );
  }
}
