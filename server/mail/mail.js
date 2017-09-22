const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    // Go to the https://myaccount.google.com/security google account, scroll down and check Allow less secure apps: ON
    auth: {
        user: 'youremail@gmail.com',
        pass: 'YourPass'
    }
});

function requestFundOverMail(email, amount, wallet, user, res) {

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"You" <youremail@gmail.com>', // sender address
        to: email,
        subject: 'BTC : Fund Requested ',
        //text: 'Hello world ?', // plain text body
        html: `
        Hello ${email}, <br>
            ${user.name} (${user.username}) has requested you to deposit ${amount} BTC to wallet address ${wallet}.<br><br>
        Thanks.<br><br>

        [ Ignore if it was not intended for you ]<br>
        `
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).json({
                message: 'Internal Error while sending email'
            });
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        res.status(200).json({
            message: 'Mail Sent'
        });
    });
}

const mailServer = {
    requestFundOverMail
}
module.exports = mailServer;