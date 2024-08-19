export async function sendMessage(
  square: number,
  player: string,
  room: string,
  playerr: string
) {
  await fetch(`http://localhost:4000/gameLogic/sendMessage`, {
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
  await fetch("http://localhost:4000/gameLogic/canPlay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rm: room }),
  });
}


