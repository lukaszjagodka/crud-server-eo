// const apiKey = require('../apikey/mail')

module.exports = function register_mail(address, token) {
  const mailgun = require('mailgun-js');
  const DOMAIN = 'sandboxad7654b0a4fd4803a653d23efdc8f2c2.mailgun.org';
  const mg = mailgun({ apiKey, domain: DOMAIN });
  const data = {
    from: 'Mailgun Sandbox <postmaster@sandboxad7654b0a4fd4803a653d23efdc8f2c2.mailgun.org>',
    to: `${address}`,
    text: 'abc',
    html: `Thanks for signing up with Crud-server-eo! You must follow this link to activate your account:<br /> 
     <html><a href="http://localhost:3001/users/register/${token}">Click here to activate</a></html>`,
  };
  mg.messages().send(data, (error, body) => {
    console.log(body);
  });
};
