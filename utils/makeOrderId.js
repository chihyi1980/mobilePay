let moment = require('moment-timezone');
const londonTimezone = 'Europe/London';
let mainOrderModel = require('../model/mainOrder');

exports.makeOrderId = async function(payType, vendingId, clientId, timezone)
{
    let dateLocalTimezone = moment().tz(timezone);
    let timestamp = dateLocalTimezone.unix();
    let strDateTime = dateLocalTimezone.format('YYYY-MM-DD hh:mm:ss');

    // console.log('strDateTime : ' + strDateTime);


    let insertObj = await mainOrderModel.insertOrder(payType, vendingId, strDateTime);
    console.log('insertObj : ' + JSON.stringify(insertObj));
    let insertId = insertObj['insertId'];
    // console.log('insertId : ' + insertId);

    let londonDate = moment().tz(londonTimezone);
    let orderId = londonDate.format('YYYYMMDD') + clientId + insertId;

    // console.log('orderId : ' + orderId);

    let updateRes = await mainOrderModel.updateOrder(orderId, insertId);

    // console.log('updateRes : ' + JSON.stringify(updateRes));

    let ans = 
    {
        'orderId' : orderId,
        'dateTime' : strDateTime,
        'timestamp' : timestamp
    };

    return ans;
}