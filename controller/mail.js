module.exports = { 
  sendMessage:function (sender, recipient, poll) {
'use strict';
const nodemailer = require('nodemailer');
    var encodedLink=encodeURI(poll);    

// Generate test SMTP service account from ethereal.email
nodemailer.createTestAccount((err, account) => {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: account.user, // generated ethereal user
            pass: account.pass  // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: sender, // sender address
        to: recipient, // recipient address comma sep list also works
        subject: 'Check out my poll!', // Subject line
        text: 'Copy and paste this link to see my poll '+poll+' .', // plain text body
        html: '<b><a href=' + encodedLink + '>click here to see my poll</a></b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

       
    });
});
}
}