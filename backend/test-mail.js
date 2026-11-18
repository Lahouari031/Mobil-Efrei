const nodemailer = require('nodemailer');

async function testMail() {


const transport = nodemailer.createTransport({ jsonTransport: true });
  const message = await transport.sendMail({
    from: "no-reply@mobilefrei.test",
    to: 'etudiant@example.com',
    subject: 'Mobil’Efrei — Test de confirmation',
    text: 'Ton code de test est 123456.',
  });

console.log(JSON.parse(message.message).text);
}

testMail().catch((error) => console.error(error.message));