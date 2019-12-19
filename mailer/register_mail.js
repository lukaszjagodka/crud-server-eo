module.exports  = function register_mail(mail, token){
    const mailgun = require("mailgun-js");
    const DOMAIN = "sandbox4ae78e850b854342bfc407e3d53939a4.mailgun.org";
    const apiKey = require('../.gitignore')
    const mg = mailgun({apiKey: "b56df9d9b056d291cf5ae00afbf162ab-f8b3d330-16a266c5", domain: DOMAIN});
    const data = {	from: "Crud-server-ep <postmaster@sandbox4ae78e850b854342bfc407e3d53939a4.mailgun.org>",
    to: `${mail}`,
    subject: "Hello",
    text: `Thanks for signing up with Crud-server-eo! You must follow this link to activate your account:<br /> 
    <a href="http://localhost:3000/users/register/${token}">Click here to activate</a>`
    };
    mg.messages().send(data, function (error, body) {
        console.log(body);
    });
}
