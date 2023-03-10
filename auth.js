const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const readline = require('readline');
const dotenv = require('dotenv');

dotenv.config();

const { client_id, client_secret, redirect_uri, refresh_token } = process.env;

const oAuth2Client = new OAuth2Client(
  client_id,
  client_secret,
  redirect_uri
);

// If modifying these scopes, delete the token.json file.
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
];

async function getAccessToken(oAuth2Client) {
  try {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (text) => new Promise((resolve) => rl.question(text, resolve));
    
    const code = await question('Enter the authorization code: ');
    rl.close();

    const { tokens } = await oAuth2Client.getToken(code);
    console.log('Access token retrieved successfully');
    return tokens.access_token;
  } catch (error) {
    console.error('Error retrieving access token:', error.message);
    process.exit(1);
  }
}

async function authorize() {
  try {
    const token = await getAccessToken(oAuth2Client);
    oAuth2Client.setCredentials({
      access_token: token,
      refresh_token,
    });
    console.log('Authorization successful');
    return oAuth2Client;
  } catch (error) {
    console.error('Error authorizing OAuth2 client:', error.message);
    process.exit(1);
  }
}

module.exports = { authorize };
