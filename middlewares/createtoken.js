import jwt from "jsonwebtoken";

const createTokenandCookies = (req, res, user) => {
  const token = jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: "10y",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: true, // must be true for HTTPS (Render)
    sameSite: "none", // required for cross-site requests
    path: "/", // makes it available everywhere
   maxAge: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
  });

  return token;
};

export default createTokenandCookies;
