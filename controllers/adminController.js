const pool = require('../config/database');
const queryHelper = require('../queryHelper/adminQuery');
const bcrypt = require('bcryptjs');
const moment = require('moment');
moment().format();


const GA_ACTIVATION_MONEY_BACK = 15;
const GB_ACTIVATION_MONEY_BACK = 25;
const GC_ACTIVATION_MONEY_BACK = 50;
const GD_ACTIVATION_MONEY_BACK = 250;

const activationMonyBack = (groupType) => {
    if (groupType === 'A') {
        return GA_ACTIVATION_MONEY_BACK;
    } else if (groupType === 'B') {
        return GB_ACTIVATION_MONEY_BACK;
    } else if (groupType === 'C') {
        return GC_ACTIVATION_MONEY_BACK;
    } else if (groupType === 'D') {
        return GD_ACTIVATION_MONEY_BACK;
    } else
        return 0;
};

const GA_REFRAL_INCOME = 30;
const GB_REFRAL_INCOME = 50;
const GC_REFRAL_INCOME = 100;
const GD_REFRAL_INCOME = 500;

const referralIncome = (groupType) => {
    if (groupType === 'A') {
        return GA_REFRAL_INCOME;
    } else if (groupType === 'B') {
        return GB_REFRAL_INCOME;
    } else if (groupType === 'C') {
        return GC_REFRAL_INCOME;
    } else if (groupType === 'D') {
        return GD_REFRAL_INCOME;
    } else
        return 0;
};

exports.home = (req, res) => {
    res.render('login', {
        title: 'Admin Login',

        adminLoginPageMess: req.flash('adminLoginPageMess')
    });
};
exports.adminGetController = (req, res) => {
    const adminId = req.session.result[0].admin_id*1;
    
    queryHelper.findAdminById(adminId, (error, result) => {
        if (error) {
            req.flash('dashPageErrMess', error.toString());
            return res.redirect('/admin');
        }
        else {
            queryHelper.companyAccountInfo((error, comAccInfoRus) => {
                if (error) {
                    req.flash('dashPageErrMess', error.toString());
                    return res.redirect('/admin');
                }
                return res.render('index', {
                    title: 'Admin Dashboard',
                    admin_id: result[0].admin_id,
                    admin_fname: result[0].admin_fname,
                    admin_lname: result[0].admin_lname,
                    admin_email: result[0].admin_email,
                    admin_password: result[0].admin_password,

                    com_inc: comAccInfoRus[0].com_inc * 1,
                    com_cost: comAccInfoRus[0].com_cost * 1,
                    com_bal: comAccInfoRus[0].com_bal * 1,

                    dashPageSuccMess: req.flash('dashPageSuccMess'),
                    dashPageErrMess: req.flash('dashPageErrMess')
                });
            });
        }
    })
};
exports.adminPostController = (req, res) => {
    const { user_id, fName, lName, email, xyz, currentPass, newPass, confPass } = req.body;

    // change name
    if (fName) {
        const data = [
            {
                admin_fname: fName,
                admin_lname: lName
            }, { admin_id: user_id }
        ]
        queryHelper.updateAdminTable(data, (error, result) => {
            if (error) {
                req.flash('dashPageErrMess', error.toString());
                return res.redirect('/admin');
            } else {
                req.flash('dashPageSuccMess', 'Name changed successfully!');
                return res.redirect('/admin')
            }
        });
    }
    //change email
    else if (email) {
        const data = [
            { admin_email: email },
            { admin_id: user_id }
        ]
        queryHelper.varifyAdminEmail(data, (error, result) => {
            if (error) {
                req.flash('dashPageErrMess', error.toString());
                return res.redirect('/admin');
            }
            if (result.length > 0) {
                req.flash('dashPageErrMess', 'Already used this email!');
                return res.redirect('/admin');
            } else {
                queryHelper.updateAdminTable(data, (error, result) => {
                    if (error) {
                        req.flash('dashPageErrMess', error.toString());
                        return res.redirect('/admin');
                    } else {
                        req.flash('dashPageSuccMess', 'Email changed successfully!');
                        return res.redirect('/admin')
                    }
                });
            }
        })
    }
    //change pass
    else if (currentPass) {
        if (newPass !== confPass) {
            req.flash('dashPageErrMess', `Password didn't match`);
            res.redirect('/admin');
        } else {
            bcrypt.compare(currentPass, xyz, async (e, r) => {
                if (e) {
                    req.flash('dashPageErrMess', e.toString());
                    res.redirect('/admin');
                }

                if (r === true) {
                    let hashedPasswword = await bcrypt.hash(newPass.trim(), 8);
                    data = [
                        { admin_password: hashedPasswword }, { admin_id: user_id }
                    ];
                    queryHelper.updateAdminTable(data, (error, result) => {
                        if (error) {
                            req.flash('dashPageErrMess', error.toString());
                            res.redirect('/admin');
                        } else {
                            req.flash('dashPageSuccMess', 'Password Changed Sucessfully!');
                            res.redirect('/admin');
                        }
                    });
                } else {
                    req.flash('dashPageErrMess', 'Current password not match');
                    res.redirect('/admin');
                }
            });
        }
    }
    else {
        req.flash('dashPageErrMess', 'Invalied Input Formate!');
        return res.redirect('/');
    }
};
// 1.0 New Id Activation Request [GET]
exports.newIdRequestGetController = (req, res) => {
    queryHelper.getApplicatonTable('new account activation', (error, getApplyTableResult) => {
        if (error) return error;

        queryHelper.companyAccountInfo((error, comAccInfoRus) => {
            if (error) return error;

            res.render('newIdActive', {
                title: 'New Id Active Request',
                dataTable: getApplyTableResult,

                com_inc: comAccInfoRus[0].com_inc * 1,
                com_cost: comAccInfoRus[0].com_cost * 1,
                com_bal: comAccInfoRus[0].com_bal * 1,

                newIdPageSuccMess: req.flash('newIdPageSuccMess'),
                neIdPageErrMess: req.flash('neIdPageErrMess')
            });

        });

    });
};
// 1.1 New Id Activation Request [POST]
exports.newIdRequestPostController = (req, res) => {
    //console.log(req.body);
    const { tokenNumber, userId, refId, refIdGrp, amount, package_group } = req.body;
    data = {
        amount: amount,
        group_type: package_group,
        com_income: amount,
        token_id: tokenNumber,
        user_id: userId
    }
    //update application & users Table
    queryHelper.accountActivQry(data, (error, result) => {
        if (error) {
            req.flash('neIdPageErrMess', error.toString());
            return res.redirect('/newIdRequest');
        }

        if (refId * 1 === 0) {
            //inser data to user income TABLE...
            let qry = 'INSERT INTO user_income (user_id, active_mony_back, ref_earning, ref_person_group) VALUES ?';
            let values = [
                [userId * 1, activationMonyBack(package_group), 0, ''],
            ];
            pool.query(qry, [values], (error, result) => {
                if (error) {
                    req.flash('neIdPageErrMess', error.toString());
                    return res.redirect('/newIdRequest');
                } else {
                    req.flash('newIdPageSuccMess', 'Successfully! active this this accout.');
                    return res.redirect('/newIdRequest');
                }
            });
        } else {

            //inser data to user income TABLE...
            let qry = 'INSERT INTO user_income (user_id, active_mony_back, ref_earning, ref_person_group, ref_candidates_Id) VALUES ?';
            let values = [
                [userId * 1, activationMonyBack(package_group), 0, '', 0],
                [refId * 1, 0, referralIncome(package_group), package_group, userId * 1]
            ];
            pool.query(qry, [values], (error, result) => {
                if (error) {
                    req.flash('neIdPageErrMess', error.toString());
                    return res.redirect('/newIdRequest');
                } else {
                    req.flash('newIdPageSuccMess', 'Successfully! active this this accout.');
                    return res.redirect('/newIdRequest');
                };
            });
        }
    });

};

// 2.0 Upgrade package [GET]
exports.upPckgRequestGetController = (req, res) => {
    queryHelper.getApplicatonTable('upgrade account', (error, getApplyTableResult) => {
        if (error) return error;

        queryHelper.companyAccountInfo((error, comAccInfoRus) => {
            if (error) return error;

            res.render('upgradePackg', {
                title: 'Upgrade Package Request',
                dataTable: getApplyTableResult,

                com_inc: comAccInfoRus[0].com_inc * 1,
                com_cost: comAccInfoRus[0].com_cost * 1,
                com_bal: comAccInfoRus[0].com_bal * 1,



                upgrdPageSuccMess: req.flash('upgrdPageSuccMess'),
                upgrdPageErrMess: req.flash('upgrdPageErrMess'),
            });
        });

    });

};
// 2.1 Upgrade package [POST]
exports.upPckgRequestPostController = (req, res) => {
    const { tokenNumber, userId, amount, package_group } = req.body;
    data = {
        amount: amount,
        user_id: userId,
        group_type: package_group,
        com_income: amount,
        token_id: tokenNumber
    }
    queryHelper.accountActivQry(data, (error, result) => {
        if (error) {
            req.flash('upgrdPageErrMess', error.toString());
            return res.redirect('/upgradePackgRequest');
        } else {
            req.flash('upgrdPageSuccMess', 'Successfully! upgrade this package.');
            return res.redirect('/upgradePackgRequest');
        }
    });
};
// 3.0 Withdraw reqiest [GET]
exports.withdrawRequestGetController = (req, res) => {

    queryHelper.getApplicatonTable('withdraw balance', (error, getApplyTableResult) => {
        if (error) return error;

        queryHelper.companyAccountInfo((error, comAccInfoRus) => {
            if (error) return error;

            res.render('withdrawRequest', {
                title: 'Withdraw Request',
                dataTable: getApplyTableResult,

                com_inc: comAccInfoRus[0].com_inc * 1,
                com_cost: comAccInfoRus[0].com_cost * 1,
                com_bal: comAccInfoRus[0].com_bal * 1,

                withReqPageSuccMess: req.flash('withReqPageSuccMess'),
                withReqPageErrMess: req.flash('withReqPageErrMess')
            });

        });

    });

};
// 3.1 Withdraw request [POST]
exports.withdrawRequestPostController = (req, res) => {
    const { tokenNumber, userId, refId, amount } = req.body;

    let data = {
        amount: amount,
        com_cost: amount,
        token_id: tokenNumber
    }
    queryHelper.withdrawBalanceQry(data, (error, result) => {
        if (error) {
            req.flash('withReqPageErrMess', error.toString());
            return res.redirect('/withdrawRequest');
        }
        pool.query(
            'UPDATE user_income SET ? WHERE ? AND ?',
            [
                { withdraw_ticket: 'used' },
                { user_id: userId },
                { ref_candidates_Id: refId }
            ],
            (error, result) => {
                if (error) {
                    req.flash('withReqPageErrMess', error.toString());
                    return res.redirect('/withdrawRequest');
                } else {
                    req.flash('withReqPageSuccMess', 'Successfull! withdraw transection.');
                    return res.redirect('/withdrawRequest');
                }
            }
        );

    });
}

// 4.0 all reqst(newId, upgrase, withdraw) [GET] 
exports.allRequestGetController = (req, res) => {
    queryHelper.applicatonTable((error, result) => {
        if (error) return error;

        queryHelper.companyAccountInfo((error, comAccInfoRus) => {
            if (error) return error;

            res.render('seeAllRequest', {
                title: 'All Resuests',
                dataTable: result,

                com_inc: comAccInfoRus[0].com_inc * 1,
                com_cost: comAccInfoRus[0].com_cost * 1,
                com_bal: comAccInfoRus[0].com_bal * 1,

                allReqPageSuccMess: req.flash('allReqPageSuccMess')
            });
        });

    });
};
// 4.1 all reqst(newId, upgrase, withdraw) [POST]
exports.allRequestPostController = (req, res) => {
    const { complainReason, tokenNumber, userId, refId, refIdGrp, amount, package_group } = req.body;

    // a)action for new acctount 
    if (complainReason === 'new account activation') {
        data = {
            amount: amount,
            group_type: package_group,
            com_income: amount,
            token_id: tokenNumber,
            user_id: userId
        }
        //update application & users Table
        queryHelper.accountActivQry(data, (error, result) => {
            if (error) {
                req.flash('neIdPageErrMess', error.toString());
                return res.redirect('/newIdRequest');
            }

            if (refId * 1 === 0) {
                //inser data to user income TABLE...
                let qry = 'INSERT INTO user_income (user_id, active_mony_back, ref_earning, ref_person_group) VALUES ?';
                let values = [
                    [userId * 1, activationMonyBack(package_group), 0, ''],
                ];
                pool.query(qry, [values], (error, result) => {
                    if (error) {
                        req.flash('neIdPageErrMess', error.toString());
                        return res.redirect('/newIdRequest');
                    } else {
                        req.flash('newIdPageSuccMess', 'Successfully! active this this accout.');
                        return res.redirect('/newIdRequest');
                    }
                }
                );
            } else {

                //inser data to user income TABLE...
                let qry = 'INSERT INTO user_income (user_id, active_mony_back, ref_earning, ref_person_group, ref_candidates_Id) VALUES ?';
                let values = [
                    [userId * 1, activationMonyBack(package_group), 0, '', 0],
                    [refId * 1, 0, referralIncome(refIdGrp), package_group, userId * 1]
                ];
                pool.query(qry, [values], (error, result) => {
                    if (error) {
                        req.flash('neIdPageErrMess', error.toString());
                        return res.redirect('/newIdRequest');
                    } else {
                        req.flash('newIdPageSuccMess', 'Successfully! active this this accout.');
                        return res.redirect('/newIdRequest');
                    }
                }
                );
            }
        });
    }
    //b)action for upgrade package
    else if (complainReason === 'upgrade account') {
        data = {
            amount: amount,
            user_id: userId,
            group_type: package_group,
            com_income: amount,
            token_id: tokenNumber
        }
        queryHelper.accountActivQry(data, (error, result) => {
            if (error) {
                req.flash('upgrdPageErrMess', error.toString());
                return res.redirect('/upgradePackgRequest');
            } else {
                req.flash('upgrdPageSuccMess', 'Successfully! upgrade this package.');
                return res.redirect('/upgradePackgRequest');
            }
        });
    }
    //c)action for withdraw balance
    else if (complainReason === 'withdraw balance') {

        let data = {
            amount: amount,
            com_cost: amount,
            token_id: tokenNumber
        }
        queryHelper.withdrawBalanceQry(data, (error, result) => {
            if (error) {
                req.flash('withReqPageErrMess', error.toString());
                return res.redirect('/withdrawRequest');
            }
            pool.query(
                'UPDATE user_income SET ? WHERE ? AND ?',
                [
                    { withdraw_ticket: 'used' },
                    { user_id: userId },
                    { ref_candidates_Id: refId }
                ],
                (error, result) => {
                    if (error) {
                        req.flash('withReqPageErrMess', error.toString());
                        return res.redirect('/withdrawRequest');
                    } else {
                        req.flash('withReqPageSuccMess', 'Successfull! withdraw transection.');
                        return res.redirect('/withdrawRequest');
                    }
                }
            );

        });

    }





};



/// utilites
// 1.0
exports.removeInvaliedAply = (req, res) => {
    const tokenId = req.body.tokenNumber;

    pool.query('DELETE FROM `application` WHERE `token_id` = ?', [tokenId], (error, result) => {
        if (error) return error;
        else {
            req.flash('newIdPageSuccMess', `TOKEN ID#${tokenId} remove successfully!`);
            req.flash('upgrdPageSuccMess', `TOKEN ID#${tokenId} remove successfully!`);
            req.flash('withReqPageSuccMess', `TOKEN ID#${tokenId} remove successfully!`);
            req.flash('allReqPageSuccMess', `TOKEN ID#${tokenId} remove successfully!`);
            return res.redirect('back');;
        }
    });
};
// 2.0
exports.pageNotFound = (req, res) => {
    res.render('404', {
        title: 'Error',

        errorPageMess: req.flash('errorPageMess')
    })
};