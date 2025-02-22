import React from 'react';
// import ReactDOM from 'react-dom';
import logo from './logo.svg';
import './App.css';
import {Game} from './Game.js';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Game dim = {3}></Game>
        <img src={logo} className="App-logo" alt="logo" />
{/* 
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
 */}
      </header>
    </div>
  );
}

export default App;

// ========================================

// ReactDOM.render(<Game />, document.getElementById("root"));
