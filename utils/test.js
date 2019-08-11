let sha256 = require('./sha256');


async function test(xml)
{

  console.log(xml);

  const soapRequest = require('easy-soap-request');
   
  const url = 'https://payment.ipay88.com.my/epayment/webservice/voidapi/voidfunction.asmx';
  const headers = 
  {
    'user-agent': 'sampleTest',
    'Content-Type': 'text/xml;charset=UTF-8',
    'soapAction': 'https://www.mobile88.com/VoidTransaction',
  };

  const { response } = await soapRequest(url, headers, xml, 1000); // Optional timeout parameter(milliseconds)
  console.log(response['body']);

  /*
  let parseString = require('xml2js').parseString;
  let body = response['body'];
  console.log(JSON.stringify(body));
  
  parseString(body, function (err, result) {
    console.log(JSON.stringify(result));
    // console.dir(result['soap:Envelope']['soap:Body']['VoidTransactionResponse']['VoidTransactionResult']);
  });
  */


}

function go()
{
  const util = require('util');
  let merchantcode = 'M16292';
  let cctransid = 'T209888413100';
  let amount = '1.00';
  let currency = 'MYR';
  let signature = genSHA(merchantcode, cctransid, amount, currency);

  let voidRequestTemplete = '<?xml version="1.0" encoding="utf-8"?> <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><VoidTransaction xmlns="https://www.mobile88.com"><merchantcode>%s</merchantcode><cctransid>%s</cctransid><amount>%s</amount><currency>%s</currency> <signature>%s</signature></VoidTransaction></soap:Body></soap:Envelope>';
  let out = util.format(voidRequestTemplete, merchantcode, cctransid, amount, currency, signature);
  

  test(out);
}

function testXML()
{
  let parseString = require('xml2js').parseString;
  let xml = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><VoidTransactionResponse xmlns="https://www.mobile88.com"><VoidTransactionResult>1011</VoidTransactionResult></VoidTransactionResponse></soap:Body></soap:Envelope>';
  parseString(xml, function (err, result) {
    //console.log(JSON.stringify(result));
    console.dir(result['soap:Envelope']['soap:Body'][0]['VoidTransactionResponse'][0]['VoidTransactionResult'][0]);
  });
}

function genSHA(merchantcode, cctransid, amount, currency)
{
  let key = 'V5NBYx6ZeF';
  let amountStr = amount.toString().replace('.','').replace(',', '');
  let tempStr = key + merchantcode + cctransid + amountStr + currency;
  let signature = sha256.SHA256(tempStr);
  return signature;
}

go();