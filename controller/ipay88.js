let ipay88Model = require('../model/ipay88');
let config = require('../config/config');
const ipay88Config = require('../config/ipay88');
const payServerUrl = config.payServerUrl;
const vendingTimezoneArr = config.vendingTimezoneArr;
let vendingModel = require('../model/vending');
const productImageUrl = config.productImageUrl;
let orderIdUtil = require('../utils/makeOrderId');
const confirmUrl = payServerUrl + '/ipay88/confirm/';
const productName = config.productName;
const currencyArr = config.currencyArr;
let router = require('express').Router();
let sha256 = require('../utils/sha256');
const soapRequest = require('easy-soap-request');
//const paymentId = '233';  //暫定


exports.pay = async function(req, res)
{

    console.log(JSON.stringify(req.params));

    let vidMd5 = req.params.vidMd5;
    let amountParam = req.params.amount;
    let paymentId = req.params.paymentId;
    let currency = req.params.currency;

    let amount = parseFloat(amountParam).toFixed(2);

    if(!amount || !vidMd5 || isNaN(amount))
    {
        res.status(500).redirect(payServerUrl + '/error.html');
        return;
    }

    let vending_id,status,country_code,client_id, buying_timestamp, vendingTimezone, orderId;
    try
    {
        let vendData = await vendingModel.getVendingDataByVidMd5(vidMd5);
        if(vendData.length == 0)
        {
            res.status(500).redirect(payServerUrl + '/error.html');
            return;
        }
        
        vending_id = vendData[0]['vending_id'];
        status = vendData[0]['status'];
        country_code = vendData[0]['country_code'];
        client_id = vendData[0]['client_id'];
        buying_timestamp = vendData[0]['buying_timestamp'];

        if(status == 'offline'){
            res.status(500).redirect(payServerUrl + '/device_offline.html');
            return;
        }else if(status == 'busy'){
            res.status(500).redirect(payServerUrl + '/device_busy.html');
            return;
        }else if(status == 'error'){
            res.status(500).redirect(payServerUrl + '/device_error.html');
            return;
        }else if(status == 'buying'){
            let timestamp = Math.floor(Date.now() / 1000);
            if((timestamp - buying_timestamp) <= 120)
                res.status(201).redirect(payServerUrl + '/service_now.html');
        }
    }catch(err)
    {
        res.status(500).redirect(payServerUrl + '/device_error.html');
        return;
    }

    vendingTimezone = vendingTimezoneArr[country_code];
    let orderData = await orderIdUtil.makeOrderId(1, vending_id, client_id, vendingTimezone);
    orderId = orderData['orderId'];

    try{
        let insertObj = await ipay88Model.insertNewOrder(paymentId, currency , orderId, amount, vending_id, vendingTimezone);
        let insertId = insertObj['insertId'];
        if(!insertId)
        {
            res.status(500).redirect(payServerUrl + '/device_error.html');
            return; 
        }
    }catch(err)
    {
        res.status(500).redirect(payServerUrl + '/device_error.html');
        return; 
    }

    let amountStr = amount.toString().replace('.','').replace(',', '');
    // let statusStr = '0';
    let tempStr = ipay88Config.Production_Testing_Merchant_Key + ipay88Config.Production_Testing_Merchant_ID + orderId + amountStr + currency;
    let signature = sha256.SHA256(tempStr);

    let postData = 
    {
        'ipay88PayURL' : ipay88Config.Production_Webservice_API_URL,
        'merchantId': ipay88Config.Production_Testing_Merchant_ID,
        'paymentId': paymentId,
        'refNo': orderId,
        'amount': amount,
        'currency': currency,
        'prodDesc' : ipay88Config.ProdDesc,
        'userName' : ipay88Config.UserName,
        'userEmail' : ipay88Config.UserEmail,
        'userContact' : ipay88Config.UserContact,
        'lang' : ipay88Config.Lang,
        'signatureType' : ipay88Config.SignatureType,
        'signature' : signature,
        'remark' : ipay88Config.Remark,
        'responseURL' : ipay88Config.ResponseURL,
        'backendURL' : ipay88Config.BackendURL,
    }

    res.render('pay', postData);

}

exports.payRes = async function(req, res)
{
    console.log(JSON.stringify(req.body));

    let orderId = req.body.RefNo;
    let transaction_id = req.body.TransId;
    let status = req.body.Status;
    let amount = req.body.Amount;

    console.log('status : ' + status);

    if(!orderId  || !transaction_id || !amount )
    {
        res.status(500).redirect(payServerUrl + '/device_error.html');
        return;
    }

    if(isNaN(status) || status != 1)
    {
        res.status(200).redirect(payServerUrl + '/paymentResult.php?result=fail');
        return;
    }

    let err_desc = req.body.ErrDesc ? req.body.ErrDesc : '';
    let cc_name = req.body.CCName ? req.body.CCName : '';
    let cc_no = req.body.CCNo ? req.body.CCNo : '';
    let bank_auth_code = req.body.AuthCode ? req.body.AuthCode : '';
    let bank_name = req.body.S_bankname ? req.body.S_bankname : '';
    let bank_contury = req.body.S_country ? req.body.S_country : '';

    try{
        let updateObj = await ipay88Model.updateOrder(transaction_id, status, err_desc, cc_name, cc_no, bank_auth_code, bank_name, bank_contury, orderId );
        // let updateId = updateObj['updateId'];

        console.log('updateObj: ' + JSON.stringify(updateObj));
        
        if(!updateObj)
        {
            res.status(500).redirect(payServerUrl + '/device_error.html');
            return; 
        }
        
    }catch(err)
    {
        console.log(err);
        res.status(500).redirect(payServerUrl + '/device_error.html');
        return; 
    }

    let vending_id ;
    try
    {
        let orderData = await ipay88Model.getPayOrderbyTxId(transaction_id);

        console.log('orderData: ' + JSON.stringify(orderData));

        // amount = orderData[0]['amount'];
        vending_id = orderData[0]['vending_id'];
        // orderId = orderData[0]['orderId'];
        if(!orderData)
        {
            res.status(500).redirect(payServerUrl + '/device_error.html');
            return; 
        }
    }catch(err)
    {
        console.log(err);
        res.status(500).redirect(payServerUrl + '/device_error.html');
        return; 
    }

    let vid_md5, vending_status, client_id, iot_server_id, buying_timestamp;
    try
    {
        let vendingData = await vendingModel.getVendingDataByVid(vending_id);

        console.log('vendingData: ' + JSON.stringify(vendingData));

        vid_md5 = vendingData[0]['vid_md5'];
        vending_status = vendingData[0]['status'];
        client_id = vendingData[0]['client_id'];
        iot_server_id = vendingData[0]['iot_server_id'];
        buying_timestamp = vendingData[0]['buying_timestamp'];
        if(!vendingData)
        {
            res.status(500).redirect(payServerUrl + '/device_error.html');
            return; 
        }

        if(vending_status == 'offline'){
            res.status(500).redirect(payServerUrl + '/device_offline.html');
            return;
        }else if(vending_status == 'busy'){
            res.status(500).redirect(payServerUrl + '/device_busy.html');
            return;
        }else if(vending_status == 'error'){
            res.status(500).redirect(payServerUrl + '/device_error.html');
            return;
        }else if(vending_status == 'buying'){
            let timestamp = Math.floor(Date.now() / 1000);
            if((timestamp - buying_timestamp) <= 120)
                res.status(201).redirect(payServerUrl + '/service_now.html');
        }

        let updateObjVed = await vendingModel.updateVedingStatus('buying', vid_md5);
        
        //TODO : update iot_sever

    }catch(err)
    {
        console.log(err);
        res.status(500).redirect(payServerUrl + '/device_error.html');
        return; 
    }

    //requery
    let request = require('request');
    let require_url = ipay88Config.Requery_URL + '?MerchantCode=' + ipay88Config.Production_Testing_Merchant_ID + '&RefNo=' + orderId + '&Amount=' + amount;


    console.log('require_url : ' + require_url);

    request.get(require_url, function(err, res2, body) {

        console.log('requery resp : ' + JSON.stringify(body));

        if(err) 
        {
          console.log(err);
          return; 
        }
        if(body == '00')
        {
            try
            {
                ipay88Model.updateConfirm( 1, '', orderId);
                res.status(200).redirect(payServerUrl + '/paymentResult.php?result=success');
            }catch(err)
            {
                console.log(err);
                res.status(500).redirect(payServerUrl + '/device_error.html');
                return; 
            }
        }else{
            try
            {
                ipay88Model.updateConfirm( 0, body, orderId);
                res.status(200).redirect(payServerUrl + '/paymentResult.php?result=fail');
            }catch(err)
            {
                console.log(err);
                res.status(500).redirect(payServerUrl + '/device_error.html');
                return; 
            }finally
            {
                let updateObj2 = vendingModel.updateVedingStatus('online', vid_md5);
                console.log('updateObj2 : ' + JSON.stringify(updateObj2) );
            }
        }
    });

}


exports.refund = async function(req, res)
{
    console.log(JSON.stringify(req.body));

    let orderId = req.params.orderId;
    let amount, currency, cctransid;
    try
    {
        let orderData = await ipay88Model.getByOrderId(orderId);

        console.log('orderData: ' + JSON.stringify(orderData));

        amount = orderData[0]['amount'];
        amount = parseFloat(amount).toFixed(2);
        currency = orderData[0]['currency'];
        cctransid = orderData[0]['transaction_id'];

        if(!orderData)
        {
            res.status(500);
            console.log('DB error');
            return; 
        }
    }catch(err)
    {
        console.log(err);
        res.status(500);
        return; 
    }

    let amountStr = amount.toString().replace('.','').replace(',', '');
    let tempStr = ipay88Config.Production_Testing_Merchant_Key + ipay88Config.Production_Testing_Merchant_ID + cctransid + amountStr + currency;
    let signature = sha256.SHA256(tempStr);
    const util = require('util');
    let outXML = util.format(ipay88Config.VoidRequestTemplete, ipay88Config.Production_Testing_Merchant_ID, cctransid, amount, currency, signature);
    
    console.log('outXML : ' + outXML);
    
    const soapRequest = require('easy-soap-request');
    const headers = 
    {
      'user-agent': 'yallvend',
      'Content-Type': 'text/xml;charset=UTF-8',
      'soapAction': 'https://www.mobile88.com/VoidTransaction',
    };
  
    const { response } = await soapRequest(ipay88Config.Production_VOID_API_URL , headers, outXML, 1000); // Optional timeout parameter(milliseconds)
    let parseString = require('xml2js').parseString;
    let body = response['body'];
    console.log(JSON.stringify(body));
    
    parseString(body, function (err, result) {
        console.log(JSON.stringify(result));
        console.dir(result['soap:Envelope']['soap:Body'][0]['VoidTransactionResponse'][0]['VoidTransactionResult'][0]);
        let ans = result['soap:Envelope']['soap:Body'][0]['VoidTransactionResponse'][0]['VoidTransactionResult'][0];
        if(ans == '00')
        {
            res.status(200).send('success');
        }else
        {
            res.status(402).send(ans);
        }
    
    });


}

exports.test = async function(req, res)
{
    res.status(200).send('success');
}

