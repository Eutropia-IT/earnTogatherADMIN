const pool = require('../config/database');
const MOMENT = require('moment');

const ACCOUNT_STATUS_TEXT = 'active';
const COMPLAIN_STATUS_TEXT = 'solved';

// 1.0 get application tabel
exports.applicatonTable = (callBack) => {
    pool.query('SELECT * FROM `application`', [], (error, result) => {
        if (error) return callBack(error);
        return callBack(null, result);
    });
}
// 1.1 get complain reasin type application tabel
exports.getApplicatonTable = (complain_reason, callBack) => {
    pool.query('SELECT * FROM `application` WHERE `complain_reason`=?', [complain_reason], (error, result) => {
        if (error) return callBack(error);
        return callBack(null, result);
    });
}

// 2.0
exports.accountActivQry = (data, callBack) => {
    pool.query(
        'UPDATE application SET ? WHERE ?',
        [
            {
                amount: data.amount,
                group_type: data.group_type,
                conplain_status: COMPLAIN_STATUS_TEXT,
                com_income: data.amount,
                solve_date: MOMENT().format('YYYY-MM-DD HH:mm:ss')
            },
            {
                token_id: data.token_id
            }
        ],
        (error, result) => {
            if (error) return callBack(error);
            // 2 users
            return pool.query(
                'UPDATE users SET ? WHERE ?',
                [
                    {
                        group_type: data.group_type,
                        account_status: ACCOUNT_STATUS_TEXT,
                        activation_date: MOMENT().format('YYYY-MM-DD HH:mm:ss')
                    },
                    {
                        user_id: data.user_id
                    }
                ],
                (error, result) => {
                    if (error) return callBack(error);
                    return callBack(null, result);
                }
            );
        }
    );
};
// 2.1 work withdraw resqest
exports.withdrawBalanceQry = (data, callBack) => {
    pool.query(
        'UPDATE application SET ? WHERE ?',
        [
            {
                amount: data.amount,
                conplain_status: COMPLAIN_STATUS_TEXT,
                com_cost: data.com_cost,
                solve_date: MOMENT().format('YYYY-MM-DD HH:mm:ss')

            }, { token_id: data.token_id }
        ],
        (error, result) => {
            if (error) return callBack(error);
            return callBack(null, result);
        }
    );
};
//  find users table form DB
exports.getUsersTable = (callBack) => {
    pool.query(
        `SELECT * ,DATEDIFF(CURRENT_TIMESTAMP(), activation_date) package_used,
        (SELECT SUM(user_income.active_mony_back)+SUM(user_income.video_earning)+SUM(user_income.ref_earning)
                FROM user_income
                WHERE user_Id = users.user_id AND (time>= users.activation_date AND time <= CURRENT_TIMESTAMP)
        ) AS cur_packg_inc
        FROM users`, 
        [], (error, result) => {
        if (error) return callBack(error);
        return callBack(null, result);
    });
};
// 3.0
exports.findUserById = (id, callBack) => {
    pool.query(
        'SELECT *,DATEDIFF(CURRENT_TIMESTAMP(), `activation_date`) package_used FROM `users` WHERE user_id=?',
        [id], (error, result) => {
            if (error) return callBack(error);
            return callBack(null, result)
        }
    );
};
// 4.0 insert data into video TABLE
exports.insertDataIntoVideo = (data, callBack) => {
    pool.query(
        'INSERT INTO `video` SET ?', data,
        (error, result) => {
            if (error) return callBack(error);
            return callBack(null, result);
        }
    );
};
// 4.1 get video table 
exports.getVideoTbale = (callBack) => {
    pool.query(
        'SELECT * FROM `video`', [], (error, result) => {
            if (error) return callBack(error);
            return callBack(null, result);
        }
    );
};
// 4.2 delete video from video TABLE
exports.deleteVideo = (videoId, callBack) => {
    pool.query(
        'DELETE FROM `video` WHERE `video_Id`= ?', [videoId],
        (error, result) => {
            if (error) return callBack(error);
            return callBack(null, result);
        }
    );
};
// 5.0 find user income withdraw balance
exports.userBalance = (id, callBack) => {
    const sqlquery =
        `SELECT
        user_id,
        SUM(user_income.active_mony_back) atcIncome,
        SUM(user_income.video_earning) vdIncome,
        SUM(user_income.ref_earning) refIncome,
        IFNULL(
            (
            SELECT
                SUM(application.amount)
            FROM
                application
            WHERE
                application.user_Id = ? AND application.complain_reason = 'withdraw balance' AND application.conplain_status = 'solved'
        ),
        0
        ) wBal,
        SUM(user_income.active_mony_back) + SUM(user_income.video_earning) + SUM(user_income.ref_earning) - IFNULL(
            (
            SELECT
                SUM(application.amount)
            FROM
                application
            WHERE
                application.user_Id = ? AND application.complain_reason = 'withdraw balance' AND application.conplain_status = 'solved'
        ),
        0
        ) balance
    FROM
        user_income
    WHERE
        user_income.user_id = ?`;

    pool.query(sqlquery, [id, id, id], (error, result) => {
        if (error) {
            return callBack(error);
        }
        return callBack(null, result);
    });

};
// 6.0 user table update
exports.updateUserTable = (data, callBack) => {
    pool.query(
        'UPDATE users SET ? WHERE ?', data, (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }

    );
};
// 6.1 deler user form user table
exports.deleteUser = (id, callBack) => {
    pool.query(
        'DELETE FROM `users` WHERE `user_id`= ?', [id],
        (error, result) => {
            if (error) return callBack(error);
            return callBack(null, result);
        }
    );
}

/// admin
// A.0 admin [TABEL]
exports.findAdminById = (id, callBack) => {
    pool.query(
        'SELECT * FROM `admin` WHERE `admin_id` =?', [id],
        (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }
    );
};
// A.1 upadate [ADMIN TABLE]
exports.updateAdminTable = (data, callBack) => {
    pool.query(
        'UPDATE admin SET ? WHERE ?', data,
        (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }
    );
};
// A.2 vafify admin email admin [TABEL]
exports.varifyAdminEmail = (email, callBack) => {
    pool.query(
        'SELECT `admin_email` FROM `admin` WHERE ? AND ?', email,
        (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }
    );
};
// A.3 company income cost balnce
exports.companyAccountInfo = (callBack) => {
    pool.query(
        'SELECT SUM(com_income) AS com_inc , SUM(com_cost) AS com_cost, SUM(com_income)-SUM(com_cost) AS com_bal FROM application', [],
        (error, result) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, result);
        }
    );
};