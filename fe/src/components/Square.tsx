import React from "react";

// Definišemo tipove za props
interface SquareProps {
  chooseSquare: () => void;
  val: string;
}

const Square: React.FC<SquareProps> = ({ chooseSquare, val }) => {
  return (
    <div className="square" onClick={chooseSquare}>
      {val}
    </div>
  );
};

export default Square;
