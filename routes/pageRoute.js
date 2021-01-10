const express = require('express');

const adminController = require('../controllers/adminController');
const formController = require('../controllers/formController');
const userController = require('../controllers/userController');
const videoUploadController = require('../controllers/videoUploadController');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

router
    .route('/')
    .get(formController.isLoggedInAuth, adminController.home);
router
    .route('/login')
    .post(formController.isLoggedInAuth, formController.adminloginPostController);
router
    .route('/logout')
    .get(formController.logoutGetController);
router
    .route('/forgotPassword')
    .get(formController.isLoggedInAuth, formController.forgotPasswordGetController)
    .post(formController.isLoggedInAuth, formController.forgotPasswordPostController);
router
    .route('/resetPassword/:token')
    .get(formController.isLoggedInAuth, formController.resetPasswordGetController)
    .post(formController.isLoggedInAuth, formController.resetPasswordPostController);

router
    .route('/admin')
    .get(formController.isLoggedOutAuth, adminController.adminGetController)
    .post(formController.isLoggedOutAuth, adminController.adminPostController);
router
    .route('/newIdRequest')
    .get(formController.isLoggedOutAuth, adminController.newIdRequestGetController)
    .post(formController.isLoggedOutAuth, adminController.newIdRequestPostController);

router
    .route('/upgradePackgRequest')
    .get(formController.isLoggedOutAuth, adminController.upPckgRequestGetController)
    .post(formController.isLoggedOutAuth, adminController.upPckgRequestPostController);

router
    .route('/withdrawRequest')
    .get(formController.isLoggedOutAuth, adminController.withdrawRequestGetController)
    .post(formController.isLoggedOutAuth, adminController.withdrawRequestPostController);

router
    .route('/allRequest')
    .get(formController.isLoggedOutAuth, adminController.allRequestGetController)
    .post(formController.isLoggedOutAuth, adminController.allRequestPostController);

router
    .route('/removeInvaliedAply')
    .post(formController.isLoggedOutAuth, adminController.removeInvaliedAply);

router
    .route('/uploadVide')
    .get(formController.isLoggedOutAuth, videoUploadController.uploadVideoGetController)
    .post(formController.isLoggedOutAuth, videoUploadController.uploadVideoPostController);
router
    .route('/removeVideo')
    .post(formController.isLoggedOutAuth, videoUploadController.removeVideoPostController);

//userController
router
    .route('/allUsers')
    .get(formController.isLoggedOutAuth, userController.allUsresGetController);

router
    .route('/createAdmin')
    .get(formController.isLoggedOutAuth, formController.createAdminGetController)
    .post(formController.isLoggedOutAuth, formController.createAdminPostController);
router
    .route('/removeAdmin')
    .post(formController.isLoggedOutAuth, formController.removeAdmin);
router
    .route('/settings')
    .get(formController.isLoggedOutAuth, settingsController.settingsGetController)
    .post(formController.isLoggedOutAuth, settingsController.settingsPostController);
router
    .route('/fof')
    .get(adminController.pageNotFound);
router
    .route('/:id')
    .get(formController.isLoggedOutAuth, userController.userProfile)
    .post(formController.isLoggedOutAuth, userController.changeUserStatus)

// router
//     .route('/changeUserStatus/:id')
//     .get(formController.isLoggedOutAuth, userController.changeUserStatus);
router
    .route('/removeUser/:id')
    .get(formController.isLoggedOutAuth, userController.deleteUser);



router
    .route('*')
    .get(adminController.pageNotFound);



module.exports = router;