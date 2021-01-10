const queryHelper = require('../queryHelper/adminQuery');
const fs = require('fs');
const multer = require('multer');
const path = require('path');



const storagePath = path.join(__dirname, '../../uaerApp/public/upload')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, storagePath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})
const upload = multer({
    storage,
    //limits: {fileSize: 10}, //10 byts

    fileFilter: (req, file, cb) => {
        const filetypes = /mp4/;
        const extName = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = filetypes.test(file.mimetype);

        if (extName && mimeType) {
            return cb(null, true);
        } else {
            cb('Error: Upload only mp4 video format')
        }
    }
}).single('filename');

exports.uploadVideoGetController = (req, res) => {
    queryHelper.getVideoTbale((error, result) => {
        if (error) {
            req.flash('videoUpErrMess', error.toString());
            return res.redirect('/uploadVide')
        }
        queryHelper.companyAccountInfo((error, comAccInfoRus) => {
            if (error) return error;

            res.render('uploadVideo', {
                title: 'Upload Video',
                videoTableData: result,

                com_inc: comAccInfoRus[0].com_inc * 1,
                com_cost: comAccInfoRus[0].com_cost * 1,
                com_bal: comAccInfoRus[0].com_bal * 1,

                videoUpSuccMess: req.flash('videoUpSuccMess'),
                videoUpErrMess: req.flash('videoUpErrMess')
            });
        });

    });
};
exports.uploadVideoPostController = (req, res) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            req.flash('videoUpErrMess', err.toString());
            return res.redirect('/uploadVide')
        } else if (err) {
            req.flash('videoUpErrMess', err);
            return res.redirect('/uploadVide');
        } else {
            const { originalname, filename } = req.file
            const { A, B, C, D } = req.body;

            let data = [{
                video_Id: filename,
                video_name: originalname,
                A, B, C, D
            }]
            queryHelper.insertDataIntoVideo(data, (error, result) => {
                if (error) {
                    req.flash('videoUpErrMess', error.toString());
                    return res.redirect('/uploadVide')
                } else {
                    req.flash('videoUpSuccMess', 'Video Upload Successfully!');
                    return res.redirect('/uploadVide')
                }
            });
        }// Everything went fine.
    });
};


exports.removeVideoPostController = (req, res) => {
    const pathToFile = path.join(storagePath, req.body.videoName);

    fs.unlink(pathToFile, (err) => {
        if (err) {
            req.flash('videoUpErrMess', err.toString());
            return res.redirect('/uploadVide')
        }
        else {
            queryHelper.deleteVideo(req.body.videoName, (error, result) => {
                if (error) {
                    req.flash('videoUpErrMess', error.toString());
                    return res.redirect('/uploadVide')
                } else {
                    req.flash('videoUpSuccMess', 'Video Delete Successfully!');
                    return res.redirect('/uploadVide')
                }
            });
        }
    })

};
