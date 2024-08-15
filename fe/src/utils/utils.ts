export async function updateBoardMP(
  prevBoard: string[],
  move: number,
  sign: string
) {
  const response = await fetch(
    "http://localhost:5000/gameLogic/updateBoardMP",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prevBoard: prevBoard,
        move: move,
        sign: sign,
      }),
    }
  );

  if (response.ok) {
    const data = await response.json();
    return data.newBoard;
  }
}

export async function checkIfWin(
  updatedBoard: string[],
  multiplayer: boolean,
  singleplayer: boolean,
  Patterns: number[][],
  myId: number
) {
  let finishedd, winnerr, gameFinishedd;
  const response = await fetch(`http://localhost:5000/gameLogic/checkWin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      updatedBoard: updatedBoard,
      multiplayer: multiplayer,
      singleplayer: singleplayer,
      Patterns: Patterns,
      myId: myId,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    finishedd = data.finished;
    winnerr = data.winner;
    gameFinishedd = data.gameFinished;
    return { finishedd, winnerr, gameFinishedd };
  }
}

export async function checkIfTied(
  board: string[],
  multiplayer: boolean,
  myId: number
) {
  let finishedd, winnerr;
  const response = await fetch(`http://localhost:5000/gameLogic/checkTie`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      board: board,
      multiplayer: multiplayer,
      myId: myId,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    finishedd = data.finished;
    winnerr = data.winner;
    return { finishedd, winnerr };
  }
}

