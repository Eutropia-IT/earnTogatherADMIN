const personalEmail = require('../utils/personalEmail');
const sendEmail = require('../utils/email');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// create admin [GET]
exports.createAdminGetController = (req, res) => {
    pool.query(
        'SELECT * FROM `admin`', [],
        (error, result) => {
            if (error) return error;

            else {

                res.render('register', {
                    title: 'Create Admin Account',

                    adminList: result,
                    adminSize: result.length,

                    regPageSuccMess: req.flash('regPageSuccMess'),
                    regPageErrMess: req.flash('regPageErrMess')
                });
            }
        }
    );
};
// create admin [POST]
exports.createAdminPostController = (req, res) => {
    const { fname, lname, email } = req.body;
    const pass = Math.random().toString(36).slice(2);

    if (!email.trim()) {
        req.flash('regPageErrMess', 'email field is empty');
        return res.redirect('/createAdmin');
    }

    pool.query(
        'SELECT `admin_email` FROM `admin` WHERE `admin_email` =?',
        [email.trim()],
        async (error, result) => {
            if (error) {
                req.flash('regPageErrMess', error.toString())
                return res.redirect('/createAdmin');
            }
            else if (result.length > 0) {
                req.flash('regPageErrMess', 'Already used this mail')
                return res.redirect('/createAdmin');
            }
            else {
                let hashedPasswword = await bcrypt.hash(pass.trim(), 8);

                pool.query(
                    'INSERT INTO admin SET ?',
                    {
                        admin_fname: fname.trim(),
                        admin_lname: lname.trim(),
                        admin_email: email.trim(),
                        admin_password: hashedPasswword
                    },
                    async (error, result) => {
                        if (error) {
                            req.flash('regPageErrMess', error.toString());
                            return res.redirect('/createAdmin');
                        }
                        const message =`You are invited as admin. A random password sends your email. Please log in and change it ASAP.
                        Login information
                        
                        Email: ${email}
                        Password: ${pass}`
                        try {
                            await sendEmail({
                                email,
                                subject: 'New Admin Account Invitation',
                                message
                            })
                            req.flash('regPageSuccMess', 'Invitation Send Successfullly!');
                            return res.redirect('/createAdmin');

                        } catch (error) {
                            req.flash('regPageErrMess', error.toString());
                            return res.redirect('/createAdmin');
                        }
                    }
                );
            }
        }
    );
};
// login
exports.adminloginPostController = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email.trim() || !password.trim()) {
            req.flash('adminLoginPageMess', 'Please fill up all require infromation!');
            return res.redirect('/');
        }
        pool.query(
            'SELECT * FROM admin WHERE admin_email = ?',
            [email.trim()],
            async (error, result) => {
                if (error) return error;

                if (result.length === 0 || !(await bcrypt.compare(password, result[0].admin_password))) {
                    req.flash('adminLoginPageMess', 'Email or Password is Incorrect!');
                    return res.redirect('/');
                } else {
                    req.session.isLoggedIn = true;
                    req.session.result = result;
                    res.redirect('/admin');
                }
            }
        );
    } catch (error) {

    }
};
// logout
exports.logoutGetController = (req, res) => {
    req.session.destroy(error => {
        if (error) {
            console.log(error);
        } else {
            res.redirect('/');
        }
    })
};
// forgot password [GET]
exports.forgotPasswordGetController = (req, res) => {
    res.render('forgotPassword', {
        title: 'Forgot Password',

        forgotPassSuccMess: req.flash('forgotPassSuccMess'),
        forgotPassErrMess: req.flash('forgotPassErrMess')
    });
};
// forgott password [POST]
exports.forgotPasswordPostController = (req, res) => {

    pool.query(
        'SELECT * FROM `admin` WHERE `admin_email` =?', [req.body.email],
        (error, result) => {
            if (error) {
                req.flash('errorPageMess', error.toString());
                return res.redirect('/fof');
            }
            else if (result.length === 0) {
                req.flash('errorPageMess', 'Invalied Email Address!');
                return res.redirect('/fof');
            }
            else {
                const resetTokenStr = crypto.randomBytes(32).toString('hex');
                passResetToken = crypto.createHash('sha256').update(resetTokenStr).digest('hex');
                let data = [{
                    user_id: result[0].admin_id,
                    reset_token: passResetToken
                }];
                pool.query(
                    'INSERT INTO forgot_password SET ?', data,
                    async (error, result) => {
                        if (error) {
                            req.flash('errorPageMess', error.toString());
                            return res.redirect('/fof');
                        } else {
                            const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${resetTokenStr}`;
                            const message = `Forgot your password? Please click this url ${resetURL} to reset your password.`;
                            try {
                                await personalEmail({
                                    email: req.body.email,
                                    subject: 'Your password reset token (valid for 10 minutes.)',
                                    message
                                });
                                req.flash('forgotPassSuccMess', `A password recovery mail sends your email address. Please check out your email!`)
                                return res.redirect('/forgotPassword');
                            } catch (error) {
                                req.flash('forgotPassErrMess', 'There was error sending the email.Try again later!');
                                return res.redirect('/forgotPassword');
                            }
                        }
                    }
                )
            }
        }
    );
};
// reset password [GET]
exports.resetPasswordGetController = (req, res) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    pool.query(
        'SELECT `user_id` FROM `forgot_password` WHERE `reset_token` = ?', [hashedToken],
        (error, result) => {
            if (error) {
                req.flash('errorPageMess', error.toString());
                return res.redirect('/fof');
            } else if (result.length === 0) {
                req.flash('errorPageMess', `Token is invalied or expired!`)
                return res.redirect('/fof');
            } else {
                res.render('resetPassword', {
                    title: 'Reset Password',
                    postURL: req.protocol + "://" + req.headers.host + req.originalUrl,

                    resetPassErrMess: req.flash('resetPassErrMess')
                });
            }
        }
    );
};
// reset password [POST]
exports.resetPasswordPostController = (req, res) => {
    const { password, cPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    pool.query(
        'SELECT `user_id` FROM `forgot_password` WHERE `reset_token` = ?', [hashedToken],
        async (error, result) => {
            if (error) {
                req.flash('errorPageMess', error.toString());
                return res.redirect('/fof');
            }
            if (!password || !cPassword) {
                req.flash('errorPageMess', `Please fillup all filds!`)
                return res.redirect('/fof');
            }
            if (password !== cPassword) {
                req.flash('resetPassErrMess', `Passward didn't match!`)
                return res.redirect(req.originalUrl);
            }
            else if (result.length === 0) {
                req.flash('errorPageMess', `Token is invalied or expired!`)
                return res.redirect('/fof');
            } else {
                let hashedPasswword = await bcrypt.hash(password.trim(), 8);
                data = [
                    { admin_password: hashedPasswword }, { admin_id: result[0].user_id }
                ];
                pool.query(
                    'UPDATE admin SET ? WHERE ?', data,
                    (error, result) => {
                        if (error) {
                            req.flash('errorPageMess', error);
                            return res.redirect('/fof');
                        } else {
                            req.flash('adminLoginPageMess', 'Password Changed Sucessfully! Pleease login with your new password.');
                            return res.redirect('/');
                        }
                    }
                );
            }
        }
    );
}


// utilites
exports.isLoggedInAuth = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/admin');
    }
    next();
};
exports.isLoggedOutAuth = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/');
    }
    next();
};
exports.removeAdmin = (req, res) => {
    const { adminUID, adminNUMs } = req.body;
    val = req.session.result[0].admin_id * 1;

    if (!adminUID) {
        req.flash('regPageErrMess', 'Input File id Empty!');
        return res.redirect('/createAdmin');
    }
    if (adminNUMs * 1 === 1) {
        req.flash('regPageErrMess', 'You are the only one. If you leave who will run this buniness.So please stay here :)');
        return res.redirect('/createAdmin');
    }
    pool.query(
        'SELECT `admin_id` FROM `admin` WHERE `admin_id`= ?', [adminUID],
        (error, result) => {
            if (error) {
                req.flash('regPageErrMess', error.toString());
                return res.redirect('/createAdmin');
            }
            if (result.length === 0) {
                req.flash('regPageErrMess', 'Invalied Admin UID');
                return res.redirect('/createAdmin');
            }
            pool.query(
                'DELETE FROM `admin` WHERE `admin_id`=?', [adminUID],
                (error, result) => {
                    if (error) {
                        req.flash('regPageErrMess', error.toString());
                        return res.redirect('/createAdmin');
                    }
                    if (val === adminUID * 1) {
                        return req.session.destroy(error => {
                            if (error) {
                                console.log(error);
                            } else {
                                res.redirect('/');
                            }
                        });
                    }
                    req.flash('regPageSuccMess', 'Remove admin Successfully!');
                    return res.redirect('/createAdmin');
                }
            );
        }
    );

};
