const express = require('express');
const {google} = require('googleapis');

const app = express();

app.get("/", async (req, res) => {

    const auth = new google.auth.GoogleAuth({
       
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets"

    });
    

    //Create cliente instance for auth
    const client = await auth.getClient();

    //Instance of Google Sheets API
    const googleSheets = google.sheets({version: "v4", auth: client});

    
    const spreadsheetId = "1dLbCsCBQh7IgPc1ckDV41SMuKscazprYsHCXfZSomAc";

    //Get metadata about spreadsheet
    const metaData = await googleSheets.spreadsheets.get({
        
        auth,

        spreadsheetId,

    })

    // Read rows from spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "engenharia_de_software",


    })

    // Write row(s) to spreadsheet
    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "engenharia_de_software",
        valueInputOption: "RAW",
        resource: {
            values: []
        }

    })

    console.log(getRows.data);
    //res.send(getRows.data);

})

app.listen(1337, (req, res) => console.log("running on 1337"));

