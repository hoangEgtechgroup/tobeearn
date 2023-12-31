const db = require("../config/connectDA");
const jwtmd5 = require("../utils/jwtmd5.utils");
const md5 = require("md5"); // Import the md5 library or module
const auth = require("../services/login.services")

//register check user has existed
let register = (req, res) => {
  const { Token, Username, Email, Password } = req.body;

  const hash_password = md5(Password);
  try {
    if (Token !== jwtmd5.secretmd5) {
      return res.json({
        // results: false,
        status: false,
        message: "FOBIDEN",
      });
    } else {
      db.query(
        `SELECT id FROM users WHERE email = ? and username = ? and password = ?`,
        [Email, Username, hash_password],
        (error, result) => {
          if (result.length == 1)
            return res.json({
              // results: true,
              status: true,
              message: "please login",
            });
          else
            db.query(
              `select id FROM users where email = ? or username = ? `,
              [Email, Username],
              (error, result) => {
                if (result.length) {
                  if (result[0].email === Email) {
                    return res.json({
                      status: 0,
                      message: "Email has existed",
                    });
                  } else if (result[0].username === Username)
                    return res.json({
                      status: 1,
                      message: "username has existed",
                    });
                } else {
                  return res.json({
                    status: false,
                    message: "user has not existed",
                  });
                }
              }
            );
        }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

//login user
let login = (req, res) => {
  const { Token, Username, Password } = req.body;
  const hash_password = md5(Password);
  try {
    if (Token !== jwtmd5.secretmd5)
      return res.json({
        // results: false,
        status: false,
        message: "FOBIDEN",
      });

    if (!Username || !Password) {
      return res.json({
        message: "Fill in the information",
        status: false,
      });
    }
    db.query(
      "SELECT * FROM users WHERE username = ? or email= ?",
      [Username, Username],
      (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).json({
            message: "Error logging in",
            status: false,
          });
        } else {
          if (results.length > 0) {
            const user = results[0];
            console.log(results[0].password);
            console.log(hash_password);
            if (hash_password === user.password) {
              return res.json({
                status: true,
                message: "Login successful",
                data: user,
              });
            } else {
              return res.json({
                message: "Error logging in",
                status: false,
              });
            }
          } else {
            return res.status(404).json({
              message: "User not found",
              status: false,
            });
          }
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

// gọi lại các phương thức
module.exports = {
  register,
  login,
};
