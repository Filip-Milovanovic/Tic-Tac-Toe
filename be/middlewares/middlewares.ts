import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Definišemo interfejs za req.data
interface CustomRequest extends Request {
  data?: JwtPayload;
}

const verifyJWT = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, "secret key", (err, data) => {
      if (err) {
        return res.status(403).json("Token is not valid");
      }
      req.data = data as JwtPayload; // Castujemo data na JwtPayload
      next();
    });
  } else {
    res.status(401).json("You are not authenticated");
  }
};

export default verifyJWT;
