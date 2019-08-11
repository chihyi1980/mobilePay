let pool = require('../db/db');
let moment = require('moment-timezone');

let iPay88Model = 
{
    insertNewOrder : async function (payment_Id, currency, orderId, amount, vending_id, timezone)
    {
        let dateLocalTimezone = moment().tz(timezone);
        let strDateTime = dateLocalTimezone.format('YYYY-MM-DD hh:mm:ss');
        let ts = dateLocalTimezone.unix();

        let conn;
        let rows;
        let sql = 'INSERT INTO ipay_order (payment_Id, currency, order_id, amount, vending_id, date_time, timestamp) VALUES (?,?,?,?,?,?,?)';

        try {
            conn = await pool.getConnection();
            rows = await conn.query(sql, [payment_Id, currency, orderId, amount, vending_id, strDateTime, ts]);
        } catch (err) {
            throw err;
        } finally {
            if (conn)
                conn.end();
            return rows;
        }
    },

    updateOrder : async function (transaction_id, confirm, err_desc, cc_name, cc_no, bank_auth_code, bank_name, bank_contury , orderId)
    {
        let conn;
        let rows;
        let sql = 'UPDATE ipay_order SET transaction_id = ?,  confirm = ?, err_desc = ? , cc_name = ?, cc_no = ? , bank_auth_code = ? , bank_name = ?, bank_contury = ?  WHERE order_id = ? ';

        try {
            conn = await pool.getConnection();
            rows = await conn.query(sql, [transaction_id, confirm, err_desc, cc_name , cc_no , bank_auth_code, bank_name , bank_contury,  orderId]);
        } catch (err) {
            throw err;
        } finally {
            if (conn)
                conn.end();
            return rows;
        }
    },    

    getPayOrderbyTxId : async function (txid)
    {
        let conn;
        let sql = "SELECT * from ipay_order where transaction_id = ?";
        let rows;

        try {
            conn = await pool.getConnection();
            rows = await conn.query(sql, [txid]);
        } catch (err) {
            throw err;
        } finally {
            if (conn)
                conn.end();
            return rows;
        }
    },

    updateConfirm : async function (confirm, err_desc, orderId)
    {
        let conn;
        let rows;
        let sql = 'UPDATE ipay_order SET confirm = ?, err_desc = ? WHERE order_id = ? ';

        try {
            conn = await pool.getConnection();
            rows = await conn.query(sql, [ confirm, err_desc, orderId]);
        } catch (err) {
            throw err;
        } finally {
            if (conn)
                conn.end();
            return rows;
        }
    }, 

    getByOrderId : async function (orderId)
    {
        let conn;
        let rows;
        let sql =  'SELECT * from ipay_order where order_id = ?';

        try {
            conn = await pool.getConnection();
            rows = await conn.query(sql, [orderId]);
        } catch (err) {
            throw err;
        } finally {
            if (conn)
                conn.end();
            return rows;
        }
    }, 


};

module.exports = iPay88Model;
