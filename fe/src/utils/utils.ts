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

export async function sendMessage(
  square: number,
  player: string,
  room: string,
  playerr: string
) {
  await fetch(`http://localhost:5000/gameLogic/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sq: square,
      pl: player,
      rm: room,
      player: playerr,
    }),
  });
}

export async function sendCanPlayFun(room: string) {
  await fetch("http://localhost:5000/gameLogic/canPlay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rm: room }),
  });
}


