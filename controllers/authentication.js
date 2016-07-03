const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
  //we just need to give them a token
  // user comes from the passport local login strategy
  res.send({ token: tokenForUser(req.user) });
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send(
      { error: 'You must supply both email and password' }
    );
  }

  // see if a user with the given email exists
  User.findOne({ email: email }, function(err, existingUser) {
    console.log(err);
    console.log(existingUser);
    if (err) { return next(err); }

    // if a user with the email does exist, return error
    if(existingUser) {
      return res.status(422).send({ error: 'Email in use' });
    }
  });

  // if a user does NOT exist, create and save user record
  const user = new User({
    email: email,
    password: password
  });

  user.save(function(err){
    if (err) { return next(err); }

    // Respond to request indicateing the user was created
    res.json({ token: tokenForUser(user)});
  });

}
