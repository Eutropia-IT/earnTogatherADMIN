const nodemailer = require('nodemailer');
const {google} = require('googleapis');

CLIENT_ID ='353143383493-17tsa46c7umhue435h134t1n4q5dtjgm.apps.googleusercontent.com'
CLIENT_SECRET ='ocyNxIndQVIt7avZ0IUgf4K9'
REDIRECT_URI ='https://developers.google.com/oauthplayground'
REFRESH_TOKEN ='1//04BrGakfizgrlCgYIARAAGAQSNwF-L9Ir4_XoZTs7jpbcnSCds7SunoETgIzF9eYB_6Tn8g8X0z3ewL1Q7T0hUHR0CMSmpNpaF2E'

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN});


const sendEmail = async options =>{
    const accessToken = await oAuth2Client.getAccessToken();
    // 1 create a transpoter
    const transpoter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'earntogether46@gmail.com',
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken
        }
    });
    // 2 Define the email options
    const mailOptions = {
        from: 'Earn Together <earntogether46@gmail.com>',
        to: [options.email, 'earntogether46@gmail.com'],
        subject: options.subject,
        text: options.message
    };
    // 3 send mail
    await transpoter.sendMail(mailOptions);
};

module.exports = sendEmail;