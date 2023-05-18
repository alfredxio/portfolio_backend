const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();
const chatId='1131349907';
// console.log(process.env.teleapi);
const bot = new TelegramBot(process.env.teleapi, { polling: true });
const app = express();
const port= process.env.PORT || 4000;
app.use(cors());
app.use(bodyParser.json());

const options = {
    timeZone: 'Asia/Kolkata',
    timeZoneName: 'short'
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'x.alfredio01@gmail.com',
    pass: process.env.pass
  }
});

app.get("/",(req,res)=>{
  res.send("Hello world, let's go Cloud");
});

app.post('/submit-form', (req, res) => {
    const { name, subject, email, message } = req.body;
    const time = new Date().toLocaleTimeString('en-US', options);
    const messageText = `New form submission on page:\n<code><b>Name:</b>${name}\n<b>Email:</b> ${email}\n<b>Subject:</b> ${subject}\n<b>Message:</b> ${message}\n\n<b>Time:</b> ${time}</code>`;
    bot.sendMessage(chatId,messageText,{parse_mode:'HTML'});
    res.send('Done');
});


bot.on('message', (msg) => {
  const repliedMessage = msg.reply_to_message;
  const message = msg.text;
  if (repliedMessage) {
    const emailRegex = /Email:\s*([^\s]+)/i;
    const match = repliedMessage.text.match(emailRegex);

    if (match) {
      const email = match[1];
      console.log('Extracted Email:', email);
      console.log("mail:"+email);

      const lines = message.split('\n');
      const subject = lines[0];
      const text = lines.slice(1).join('\n');

      const mailOptions = {
        from: 'x.alfredio01@gmail.com',
        to: email,
        subject: subject,
        text: text
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
        console.log(error);
          }
        else {
          console.log('Email sent: ' + info.response);
          bot.sendMessage(chatId,"Email sent to "+email);
        }
      });

    } else {
      console.log('Email not found in the message');
    }
  } else {
    bot.sendMessage(chatId,"No message selected");
  }
});

app.listen(port,'0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
