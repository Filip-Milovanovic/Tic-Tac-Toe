import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Square from "./Square";

const GameHistory = () => {
  const [showResults, setShowResults] = useState(false);
  const [historyResult, setHistoryResult] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const parsedData = JSON.parse(user);

    const getResults = async () => {
      try {
        const response = await fetch("http://localhost:5000/game/getHistory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: parsedData.username }),
        });

        if (!response.ok) {
          console.log("NECE");
          throw new Error("Network response was not ok");
        }

        const result = await response.json();
        setHistoryResult(result);
        setShowResults(true);
      } catch (error) {
        console.log(error.message);
      }
    };

    getResults();
  }, []); // Prazan niz zavisnosti znači da se useEffect poziva samo pri prvom renderu

  return (
    <div className="results-container">
      {!showResults && <h1>Show All Results</h1>}
      {!showResults && (
        <button onClick={() => setShowResults(true)}>SHOW</button>
      )}
      {showResults && <ResultsList results={historyResult} />}
    </div>
  );
};

const ShowBoard = ({ initialArray }) => {
  const [boardState, setBoardState] = useState(initialArray);

  useEffect(() => {
    setBoardState(initialArray);
  }, [initialArray]);

  return (
    <div className="board">
      {[0, 1, 2].map((rowIndex) => (
        <div className="row" key={rowIndex}>
          {[0, 1, 2].map((colIndex) => {
            const squareIndex = rowIndex * 3 + colIndex;
            return <Square key={squareIndex} val={boardState[squareIndex]} />;
          })}
        </div>
      ))}
    </div>
  );
};

const ResultsList = ({ results }) => {
  const [clickedBoard, setClickedBoard] = useState([]);

  const handleClicked = (array1, array2) => {
    const board = ["", "", "", "", "", "", "", "", ""];
    array1.forEach((el) => (board[el] = "X"));
    array2.forEach((el) => (board[el] = "O"));

    setClickedBoard(board);
  };

  return (
    <div className="main-div">
      <ul className="result-list">
        {results.map((res) => (
          <ResultsListElement
            data={res}
            updateClicked={handleClicked}
            key={res.id}
          />
        ))}
      </ul>
      {clickedBoard.length > 0 && <ShowBoard initialArray={clickedBoard} />}
    </div>
  );
};

const ResultsListElement = ({ data, updateClicked }) => {
  return (
    <>
      {data.player2 !== null ? (
        <li
          onClick={() => {
            updateClicked(data.player1moves, data.player2moves);
          }}
          className="result-list-item"
        >
          <div className="history-div">
            <p className="hist-hd">Player1: </p>
            <p>{data.player1}</p>
          </div>
          <div className="history-div">
            <p className="hist-hd">Player2: </p>
            <p>{data.player2}</p>
          </div>
          {data.finished && (
            <div className="history-div">
              <p className="hist-hd">Winner: </p>
              <p>
                {(() => {
                  if (data.winner === "Player 1") {
                    return data.player1;
                  } else if (data.winner === "Player 2") {
                    return data.player2;
                  } else {
                    return "tie";
                  }
                })()}
              </p>
            </div>
          )}
  
          <div className="history-div">
            <p className="hist-hd">Finished: </p>
            <p>{data.finished ? "finished" : "not finished"}</p>
          </div>
        </li>
      ) : (
        ""
      )}
    </>
  );
  
};

export default GameHistory;
