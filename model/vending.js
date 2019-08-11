let pool = require('../db/db');

let vendingModel = 
{
    getVendingDataByVidMd5 : async function (vidMd5)
    {
        let conn;
        let sql = 'SELECT * FROM vending_data WHERE vid_md5 = ?';
        let rows;
        try {
            conn = await pool.getConnection();
            rows = await conn.query(sql, [vidMd5]);
        } catch (err) {
            throw err;
        } finally {
            if (conn)
                conn.end();
            return rows;
        }
    },

    getVendingDataByVid : async function (vid)
    {
        let conn;
        let sql = 'SELECT * FROM vending_data WHERE vending_id = ?';
        let rows;
        try {
            conn = await pool.getConnection();
            rows = await conn.query(sql, [vid]);
        } catch (err) {
            throw err;
        } finally {
            if (conn)
                conn.end();
            return rows;
        }
    },

    updateVedingStatus : async function (status, vidMd5)
    {
        let conn;
        let sql = 'UPDATE vending_data SET status = ? WHERE vid_md5 = ?';
        let rows;
        try {
            conn = await pool.getConnection();
            rows = await conn.query(sql, [status, vidMd5]);
        } catch (err) {
            throw err;
        } finally {
            if (conn)
                conn.end();
            return rows;
        }
    }
}

module.exports = vendingModel;