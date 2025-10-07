const Authagent = (req, res, next) => {
  console.log(req?.user);
  console.log(req?.user?.isagent);

  if (!req?.user?.isagent) {
    res.status(400).json({
      error: "Access denied! Agents only ",
    });
  }
  next();
};

export default Authagent;
