const queryHelper = require('../queryHelper/adminQuery');
const pool = require('../config/database');
const MOMENT = require('moment');

// 1.0 all users
exports.allUsresGetController = (req, res) => {
    queryHelper.getUsersTable((error, result) => {
        if (error) return error;

        queryHelper.companyAccountInfo((error, comAccInfoRus) => {
            res.render('allUsers', {
                title: 'All Users',

                com_inc: comAccInfoRus[0].com_inc * 1,
                com_cost: comAccInfoRus[0].com_cost * 1,
                com_bal: comAccInfoRus[0].com_bal * 1,

                userTableData: result
            });
        });

    });

};

// 2.0 user profile
exports.userProfile = (req, res) => {
    const id = req.params.id * 1;

    if (!id) {
        return res.render('404');
    }
    queryHelper.findUserById(id, (error, userResult) => {
        if (error) return error;
        if (userResult.length === 0) {
            return res.render('404');
        }
        queryHelper.userBalance(id, (error, balResult) => {
            if (error) return error;

            pool.query('SELECT `user_id`,`active_mony_back`,`time` FROM `user_income` WHERE `user_id`= ? AND `active_mony_back` !=0', [id], (error, getActivationMTable) => {
                if (error) return error;

                pool.query('SELECT `user_id`,`video_earning`, `time` FROM user_income WHERE `user_id` = ? AND `video_earning` !=0', [id], (error, getVideoErnTable) => {
                    if (error) return error;

                    pool.query('SELECT `user_id`,`ref_earning`,`time` FROM user_income WHERE `user_id` = ? AND `ref_earning`!=0', [id], (error, getRefIncomeTable) => {
                        if (error) return error;

                        pool.query(`SELECT user_Id, amount, solve_date FROM application WHERE user_Id = ? AND complain_reason = 'withdraw balance' AND conplain_status ='solved'`, [id], (error, getWithdrawTable) => {
                            if (error) return error;

                            pool.query('SELECT user_id, ref_earning, ref_candidates_Id, ref_person_group, withdraw_ticket FROM user_income WHERE ref_earning != 0 AND user_id = ?', [id], (error, refListTable) => {
                                if (error) return error;

                                queryHelper.companyAccountInfo((error, comAccInfoRus) => {
                                    if (error) return error;

                                    return res.render('userProfile', {
                                        title: 'User Profile',
                                        user_id: userResult[0].user_id,
                                        firstName: userResult[0].firstName,
                                        lastName: userResult[0].lastName,
                                        email: userResult[0].email,
                                        phone: userResult[0].phone,
                                        group_type: userResult[0].group_type,
                                        account_status: userResult[0].account_status,
                                        activationDate: userResult[0].activation_date,
                                        packageUsed: userResult[0].package_used * 1,

                                        totalEarnBal: balResult[0].atcIncome + balResult[0].vdIncome + balResult[0].refIncome,
                                        atcIncome: balResult[0].atcIncome * 1,
                                        vdIncome: balResult[0].vdIncome * 1,
                                        refIncome: balResult[0].refIncome * 1,
                                        wBal: balResult[0].wBal,
                                        balance: balResult[0].balance * 1,
                                        activationMonBack: getActivationMTable,
                                        videoEarning: getVideoErnTable,
                                        refEarning: getRefIncomeTable,
                                        withdrawBal: getWithdrawTable,

                                        com_inc: comAccInfoRus[0].com_inc * 1,
                                        com_cost: comAccInfoRus[0].com_cost * 1,
                                        com_bal: comAccInfoRus[0].com_bal * 1,

                                        refListData: refListTable
                                    });
                                });

                            });

                        });

                    });

                });

            });

        });
    });
};

exports.deleteUser = (req, res) => {
    const id = req.params.id * 1;

    if (!id) {
        return res.render('404');
    }
    queryHelper.deleteUser(id, (error, result) => {
        if (error) return res.redirect('/allUsers');
        else return res.redirect('/allUsers');
    });
};
exports.changeUserStatus = (req, res) => {
    const id = req.params.id * 1;
    if (!id) {
        return res.render('404');
    }
    let data = [
        {
            account_status: req.body.accountStatus,
            activation_date: MOMENT().format('YYYY-MM-DD HH:mm:ss')
        },
        { user_id: id }
    ]
    queryHelper.updateUserTable(data, (error, result) => {
        if (error) return res.redirect('back');
        else return res.redirect('back');
    });
};