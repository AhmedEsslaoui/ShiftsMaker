import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';
const FILE_ID = '1WW_6Jdh5k3hrvZNxmf_j7IpEQrG35_GQ'; // Updated with the provided file ID

let oauth2Client: OAuth2Client;

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(path.join(process.cwd(), CREDENTIALS_PATH), 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  try {
    const token = JSON.parse(fs.readFileSync(path.join(process.cwd(), TOKEN_PATH), 'utf8'));
    oauth2Client.setCredentials(token);
  } catch (error) {
    await getNewToken(oauth2Client);
  }
}

async function getNewToken(oauth2Client: OAuth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  
  const code = await new Promise<string>((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    readline.question('Enter the code from that page here: ', (code: string) => {
      readline.close();
      resolve(code);
    });
  });

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  
  fs.writeFileSync(path.join(process.cwd(), TOKEN_PATH), JSON.stringify(tokens));
  console.log('Token stored to', TOKEN_PATH);
}

export async function readJSONFile() {
  await authorize();
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const response = await drive.files.get({ fileId: FILE_ID, alt: 'media' });
  return response.data;
}

export async function writeJSONFile(data: any) {
  await authorize();
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  await drive.files.update({
    fileId: FILE_ID,
    media: {
      mimeType: 'application/json',
      body: JSON.stringify(data),
    },
  });
}