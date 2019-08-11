let pool = require('../db/db');

let mainOrderModel = 
{
    insertOrder : async function (payType, vendingId, dateTime)
    {
        let conn;
        let rows;
        let sql = 'INSERT INTO main_order (pay_type, vending_id, date_time ) VALUES (?, ?, ?)';

        try {
            conn = await pool.getConnection();
            rows = await conn.query(sql, [payType, vendingId, dateTime]);
        } catch (err) {
            throw err;
        } finally {
            if (conn)
                conn.end();
            return rows;
        }
    },

    updateOrder : async function (orderId, insertId)
    {
        let conn;
        let rows;
        let sql = 'UPDATE main_order SET order_id = ? WHERE main_order_id = ?';

        try {
            conn = await pool.getConnection();
            rows = await conn.query(sql, [orderId, insertId]);
        } catch (err) {
            throw err;
        } finally {
            if (conn)
                conn.end();
            return rows;
        }
    },
}

module.exports = mainOrderModel;