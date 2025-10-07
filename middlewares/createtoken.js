import jwt from "jsonwebtoken";

const createTokenandCookies = (req, res, user) => {
  const token = jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true, // only true in production
    sameSite: "lax", // allow cross-origin on localhost
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export default createTokenandCookies;
