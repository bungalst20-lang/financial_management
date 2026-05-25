const bcrypt = require("bcrypt");
const db = require("../config/db");

exports.register = async (req, res) => {
  const { full_name, username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users(full_name, username, password) VALUES (?, ? ,?)",
    [full_name, username, hashedPassword],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Register success",
      });
    },
  );
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length === 0) {
        return res.status(400).json({
          message: "Username or password is wrong!!!",
        });
      }

      const user = result[0];

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          message: "Username or password is wrong!!!",
        });
      }

      req.session.userId = user.id;

      res.json({
        message: "Login success",
        user: {
          id: user.id,
          fullName: user.full_name,
          username: user.username,
        },
      });
    },
  );
};

exports.logout = (req, res) => {
  req.session.destroy();

  res.json({
    message: "Logout success",
  });
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  db.query(
    "SELECT * FROM users WHERE id = ?",
    [req.session.userId],
    async (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      const user = result[0];

      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({
          message: "Wrong old password",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, req.session.userId],
        (err) => {
          if (err) {
            return res.status(500).json(err);
          }

          res.json({
            message: "Password changed",
          });
        },
      );
    },
  );
};

exports.forgotPassword = async (req, res) => {
  const { username, newPassword } = req.body;

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  db.query(
    "UPDATE users SET password = ? WHERE username = ?",
    [hashedPassword, username],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Password reset success",
      });
    },
  );
};
