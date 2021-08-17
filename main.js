const {google} = require('googleapis');
const keys = require('./keys.json');


//authentication to the googlesheet with keys, e-mail and desired scope
const client = new google.auth.JWT(
    keys.client_email, 
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);


//Used to estabilsh/verify connection with the googlesheet
client.authorize(function(err, tokens){

    if(err){
        console.log(err);
        return;
    } else{
        console.log('Connected!');
        gsapi(client);
    }
});


//The magic starts here
async function gsapi(client){

    const googleSheet = google.sheets({
        version: 'v4',
        auth: client
    });

    //sheet location and sheet tab 
    const configs = {
        spreadsheetId: '1dLbCsCBQh7IgPc1ckDV41SMuKscazprYsHCXfZSomAc',
        range: 'engenharia_de_software'
    };
    
    
    console.log("Getting SheetData specifications...")
    
    //sheetData literally all the information you need from the sheet, but to keep it short and more straight foward
    //I create tempArray just to store the basic sheet data (lines and columns).   
    let sheetData = await googleSheet.spreadsheets.values.get(configs);
    let tempArray = sheetData.data.values;
    
    console.log("Done! ");

    console.log("Applying rules on the students grades, just a sec...");

    //updatedArray is used on the .update function to fill the real google spreadsheet,
    //function rule() it's where all the necessary rules and exceptions are, I decided to 
    //split it off of the main code for readability
    let updatedArray = rules(tempArray);


    //configs to upddate the sheet
    const configsToUpdate = {
        spreadsheetId: '1dLbCsCBQh7IgPc1ckDV41SMuKscazprYsHCXfZSomAc',
        range: 'engenharia_de_software',
        valueInputOption: 'USER_ENTERED',
        resource: {values: updatedArray}
    };
    
    
    console.log("Attempting to update GoogleSheet with new values...")
    try{
         //Call to update real time googlesheet
        let response = await googleSheet.spreadsheets.values.update(configsToUpdate);
        
        console.log('Sucess! Check your GoogleSheet.')
    

    } catch(e){
        console.log("Failed to Update" + e)
    }
    
    
    function rules(sheet){
        
        
        for(studentRow = 3; studentRow < sheet.length; studentRow++){

            //variables created based on the header's name
            let totalClasses = sheet[1][2],
                absence = parseInt(sheet[studentRow][2]),
                p1 = parseInt(sheet[studentRow][3]),
                p2 = parseInt(sheet[studentRow][4]),
                p3 = parseInt(sheet[studentRow][5]),
                average = (p1 + p2 + p3)/3,
                situacao = 6,
                notaApFinal = 7; 
                   
            
            if(absence> totalClasses*0.25){
                sheet[studentRow][6] = 'Reprovado por Falta';
                sheet[studentRow][notaApFinal] = 0;
        
            } else{

                if(average > 70){
                    sheet[studentRow][situacao] = 'Aprovado';
                    sheet[studentRow][notaApFinal] = 0;
                
                } else{

                    if(average >= 50 && average < 70){
                        sheet[studentRow][situacao] = 'Exame Final';

                        //I tought about just making 100-average note, but instead I just wrapped the code in a
                        //while loop. If the customer decides to change the base formula, it will be easier to
                        //fix inside the code whereas the code it's identical to the formula. 
                        let naf = 0;
                        while(((average+naf)/2) < 50){
                            naf++;
                        }
                        sheet[studentRow][notaApFinal] = naf;
                    
                        
                    } else {
                        sheet[studentRow][situacao] = 'Reprovado por Nota';
                        sheet[studentRow][notaApFinal] = 0;
                    }
                }
            }
        }    

        return sheet;    
    }
}



   


        
    





