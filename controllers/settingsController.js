const queryHelper = require('../queryHelper/adminQuery');
const fs = require('fs');
const path = require('path');

const tergetPath = path.join(__dirname, '../../uaerApp/dynamicCont/pay.json');
console.log(tergetPath)
exports.settingsGetController = (req, res) => {
    let data = JSON.parse(fs.readFileSync(tergetPath));
    queryHelper.companyAccountInfo((error, comAccInfoRus) => {
        if (error) return error;

        res.render('settings', {
            title: 'Settings',
            bKash: data[0].bKash,
            rocket: data[1].rocket,

            com_inc: comAccInfoRus[0].com_inc * 1,
            com_cost: comAccInfoRus[0].com_cost * 1,
            com_bal: comAccInfoRus[0].com_bal * 1,

            settingsPageSuccMess: req.flash('settingsPageSuccMess'),
            settingsPageErrMess: req.flash('settingsPageErrMess')
        })

    });
};

exports.settingsPostController = (req, res) => {
    const { bKash, rocket } = req.body;
    const newData = JSON.stringify([{ bKash }, { rocket }]);
    fs.writeFile(tergetPath, newData, (err) => {
        if (err) {
            req.flash('settingsPageErrMess', err.toString());
            return res.redirect('/settings');
        } else {
            req.flash('settingsPageSuccMess', 'Number Changed Successfully!');
            return res.redirect('/settings');
        }
    });
}