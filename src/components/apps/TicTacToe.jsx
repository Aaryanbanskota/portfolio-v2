import { useState } from 'react';
import './TicTacToe.css';

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return null;
  };

  const winner = calculateWinner(board);
  const status = winner ? `Winner: ${winner}` : board.every(s => s) ? 'Draw!' : `Next player: ${isXNext ? 'X' : 'O'}`;

  const handleClick = (i) => {
    if (board[i] || winner) return;
    const newBoard = board.slice();
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  return (
    <div className="tic-tac-toe">
      <h2>Tic Tac Toe</h2>
      <div className="status">{status}</div>
      <div className="board">
        {board.map((sq, i) => (
          <button key={i} className="square" onClick={() => handleClick(i)}>
            {sq}
          </button>
        ))}
      </div>
      <button className="reset-btn" onClick={() => { setBoard(Array(9).fill(null)); setIsXNext(true); }}>Restart Game</button>
    </div>
  );
}
