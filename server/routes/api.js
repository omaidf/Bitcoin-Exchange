const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user.js');
const bitGoJS = require('bitgo');
const mailServer = require('../mail/mail.js');
var rssParser = require("rss-parser");
const accessToken = ""; //add your own access token

const bitGo = new bitGoJS.BitGo({
  env: 'test',
  accessToken,
});

bitGo.session({})
  .then(function(res) {
    console.log(res);
    bitGo.unlock({
      otp: '0000000'
    }, function callback(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Unlock Success");
      }
    });
  })
  .catch(function(err) {
    console.log(err);
    process.exit(-1);
  });

router.post('/register', function(req, res) {
  User.register(new User({
    name: req.body.name,
    username: req.body.username,
    phone: '0000000000'
  }),
    req.body.password,
    function(err, account) {
      if (err) {
        return res.status(500).json({
          err: err
        });
      }
      passport.authenticate('local')(req, res, function() {
        var params = {
          "passphrase": req.body.username,
          "label": req.body.username
        }
        bitGo.wallets().createWalletWithKeychains(params, function(err, result) {
          if (err) {
            console.log(err);

            // Failed, Delete user also
            User.deleteOne({
              username: req.body.username
            }, (err) => {
              if (err) console.log(err);
            })
            return res.status(500).json({
              'err': {
                code: err.code,
                Error: err.Error,
                message: "Error while creating wallet, Try again later"
              }
            });
          }
          User.update({
            username: req.body.username
          }, {
            wallet: result.wallet.id()
          }, function(err, rawResponse) {
            if (err) {
              User.deleteOne({
                username: req.body.username
              }, (err) => {
                if (err) console.log(err);
              })
              return res.status(500).json({
                err: err
              });
            }
            return res.status(200).json({
              status: 'Registration successful!'
            });
          })
        });
      });
    });
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      console.log(user);
      res.status(200).json({
        status: 'Login successful!'
      });
    });
  })(req, res, next);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});

router.get('/status', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      status: false
    });
  }
  res.status(200).json({
    status: true
  });
});


router.get('/getBCBalance', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(500).json({
      'err': {
        code: 420,
        message: "Error while fetching balance, User Not Authenticated"
      }
    });
  }
  let user = req.user;
  bitGo.wallets().get({
    type: 'bitcoin',
    id: user.wallet
  }, function(err, wallet) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        'err': {
          message: "Error while fetching balance, Internal error"
        }
      });
    }
    console.log('Wallet balance is: ' + wallet.balance() + ' Satoshis');
    res.status(200).json({
      status: true,
      data: wallet.balance()
    });
  });

});

router.get('/transactions', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(500).json({
      'err': {
        code: 420,
        message: "Error while fetching balance, User Not Authenticated"
      }
    });
  }
  let user = req.user;
  bitGo.wallets().get({
    type: 'bitcoin',
    id: user.wallet
  }, function(err, wallet) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        'err': {
          message: "Error while fetching wallet, Internal error"
        }
      });
    }
    wallet.transactions({}, function callback(err, transactions) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          'err': {
            message: "Error while fetching wallet transactions"
          }
        });
      }
      //console.log(transactions);
      res.status(200).json({
        status: true,
        data: transactions
      });
    });
  });

});
router.post('/sendfunds', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(500).json({
      'err': {
        code: 420,
        message: "Error while fetching balance, User Not Authenticated"
      }
    });
  }
  let user = req.user;
  console.log(user);
  bitGo.wallets().get({
    type: 'bitcoin',
    id: user.wallet
  }, function(err, wallet) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        'err': {
          message: "Error while fetching wallet, Internal error"
        }
      });
    }
    console.log(req.body);
    wallet.sendCoins({
      address: req.body.sendAddress,
      amount: Math.round(req.body.sendAmount * 100000000),
      walletPassphrase: req.user.username
    }, function callback(err, result) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          'err': err
        });
      }
      console.log(result);
      res.status(200).json({
        status: true,
        data: result
      });

    });
  });

});
router.get('/info', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(500).json({
      'err': {
        code: 420,
        message: "Error while fetching user info, User Not Authenticated"
      }
    });
  }
  let user = req.user;
  res.status(200).json({
    status: true,
    data: {
      name: user.name,
      wallet: user.wallet,
      email: user.username,
      phone: user.phone
    }
  });
});

router.post('/changename', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(500).json({
      'err': {
        code: 420,
        message: "Error while fetching user info, User Not Authenticated"
      }
    });
  }
  User.update({
    username: req.user.username
  }, {
    name: req.body.name
  }, function(err, rawResponse) {
    if (err) {
      return res.status(500).json({
        err: err
      });
    }
    req.user.name = req.body.name;
    return res.status(200).json({
      status: true,
      data: {
        name: req.user.name
      }
    });
  })
});

router.post('/changephone', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(500).json({
      'err': {
        code: 420,
        message: "Error while fetching user info, User Not Authenticated"
      }
    });
  }
  User.update({
    username: req.user.username
  }, {
    phone: req.body.phone
  }, function(err, rawResponse) {
    if (err) {
      return res.status(500).json({
        err: err
      });
    }
    req.user.phone = req.body.phone;
    return res.status(200).json({
      status: true,
      data: {
        name: req.user.phone
      }
    });
  })
});

router.post('/changepass', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(500).json({
      'err': {
        code: 420,
        message: "Error while fetching user info, User Not Authenticated"
      }
    });
  }
  let newPass = req.body.newPass;
  User.findByUsername(req.user.username).then(function(sanitizedUser) {
    if (sanitizedUser) {
      sanitizedUser.setPassword(newPass, function() {
        sanitizedUser.save();
        res.status(200).json({
          message: 'password reset successful'
        });
      });
    } else {
      res.status(500).json({
        message: 'This user does not exist'
      });
    }
  }, function(err) {
    res.status(500).json({
      message: 'Internal Error resetting password'
    });
  })
});

router.post('/reqfunds', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(500).json({
      'err': {
        code: 420,
        message: "Error while fetching user info, User Not Authenticated"
      }
    });
  }

  let reqAddress = req.body.reqAddress;
  let reqAmount = req.body.reqAmount;
  let walletAddress = req.user.wallet;

  mailServer.requestFundOverMail(reqAddress, reqAmount, walletAddress, req.user, res);

});

router.get('/getfeeds', function(req, res) {
  let feeds = [];
  rssParser.parseURL('http://feeds.feedburner.com/Coindesk', function(err, parsed) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        'err': {
          code: 500,
          message: "Error while fetching feeds"
        }
      });
    }
    parsed.feed.entries.forEach(function(entry, index) {
      if (index < 10) {
        feeds.push({
          title: entry.title,
          link: entry.link,
          content: entry.content.split('<p>')[0]
        });
      }
    })
    return res.status(200).json({
      status: true,
      data: {
        data: feeds
      }
    });
  })
});

module.exports = router;