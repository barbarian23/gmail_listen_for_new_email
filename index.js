const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/pubsub',
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';


//schedule moi ngay 1 lan
function doGmail() {
  // Load client secrets from a local file.
  //setInterval(intervalGetEmail,5000);
  fs.readFile('credentical.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), getMessage);
  });
}

setInterval(doGmail, 5000); 

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  auth = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(auth, callback);
    auth.setCredentials(JSON.parse(token));
    //callback();
    callback(auth);
  });
}


/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:\n', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}


 function getMessage(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    let messageId = "";
    
    gmail.users.history.list({
      'userId': 'upit.care@gmail.com',
      startHistoryId: "22991"//22940
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
     // console.log(JSON.stringify(res));
      // res.data.history.forEach(e => {
      //   messageId = e.messages[0].id;
      //   gmail.users.messages.get({
      //     'userId': 'me',
      //     'id': messageId
      //   }, (err, res) => {
      //     if (err) return console.log('The API returned an error: ' + err);
      //     //lay message
      //     console.log("messageId", messageId);
      //     // console.log(JSON.stringify(res.data));
      //     console.log('\ndate received ' + JSON.stringify(res.data.payload.headers[18]));
      //     console.log('\ncontent ' + JSON.stringify(res.data.snippet));
      //     console.log('*********************************\n');
      //   });
      // })
      
      if (!res.data.history){
        console.log("cannot get history");
      return;
      } else{
        messageId = res.data.history[0].messages[0].id;
        gmail.users.messages.get({
          'userId': 'me',
          'id': messageId
        }, (err, res) => {
          if (err) return console.log('The API returned an error: ' + err);
    
          //lay message
          console.log("res.data.historyId", JSON.stringify(res.data.historyId));
    
          // console.log(JSON.stringify(res.data));
          console.log('messageId', messageId);
          console.log('\ndate received ' + JSON.stringify(res.data.payload.headers[18]));
          console.log('\nsender ' + JSON.stringify(res.data.payload.headers[17]));
          console.log('\ntitle ' + JSON.stringify(res.data.payload.headers[20]));
          console.log('\ncc ' + JSON.stringify(res.data.payload.headers[22]));
          console.log('\ncontent ' + JSON.stringify(res.data.snippet));
          console.log('*********************************\n');
        });
      
      }
     
    })
    //request.execute(callback);
  

  }