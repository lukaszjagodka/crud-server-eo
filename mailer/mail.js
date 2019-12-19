const mailgun = require("mailgun-js");
const DOMAIN = "sandbox4ae78e850b854342bfc407e3d53939a4.mailgun.org";
const mg = mailgun({apiKey: "b56df9d9b056d291cf5ae00afbf162ab-f8b3d330-16a266c5", domain: DOMAIN});
const data = {	from: "Mailgun Sandbox <postmaster@sandbox4ae78e850b854342bfc407e3d53939a4.mailgun.org>",
to: "kosz.kosz@protonmail.com",
subject: "Hello",
text: "God, i love being white"
};
mg.messages().send(data, function (error, body) {
    console.log(body);
});