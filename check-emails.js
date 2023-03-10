const { google } = require('googleapis');
const fs = require('fs');
const util = require('util');

const readFileAsync = util.promisify(fs.readFile);

let sentThreads = [];

async function checkEmails() {
  const credentials = JSON.parse(await readFileAsync('credentials.json'));
  const token = JSON.parse(await readFileAsync('token.json'));

  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(token);

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const inbox = await gmail.users.labels.get({ userId: 'me', id: 'INBOX' });
  console.log(`You have ${inbox.data.messagesTotal} emails in your inbox`);

  const messages = await gmail.users.messages.list({
    userId: 'me',
    labelIds: ['INBOX'],
  });

  for (const message of messages.data.messages) {
    const messageData = await gmail.users.messages.get({ userId: 'me', id: message.id });
    const { payload, threadId } = messageData.data;

    // Check if the message has any prior replies
    if (!payload.headers.some((header) => header.name === 'In-Reply-To')) {
      console.log('No prior replies found. Sending reply now...');

      // Check if a vacation response has already been sent to this thread
      if (sentThreads.includes(threadId)) {
        console.log('Vacation response has already been sent to this thread. Skipping...');
        continue;
      }

      // Send a reply to the message
      const messageParts = [
        `From: vacationmailsender@gmail.com`,
        `To: ${payload.headers.find((header) => header.name === 'From').value}`,
        `Subject: RE: ${payload.headers.find((header) => header.name === 'Subject').value}`,
        '',
        'Thank you for your email. I am currently out of office on vacation and will not be able to respond until I return. I appreciate your patience and look forward to getting back to you soon.',
      ];

      const encodedMessage = messageParts.join('\n').trim();
      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: Buffer.from(encodedMessage).toString('base64'),
          threadId: threadId,
        },
      });

      console.log('Reply sent successfully');
      sentThreads.push(threadId);
    }
  }
}

module.exports = checkEmails;
