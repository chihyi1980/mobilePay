module.exports = {
    DB_config_DEV :
    {
        host: '127.0.0.1', 
        user:'root', 
        password: 'root',
        connectionLimit: 5,
        database: 'papaiot_vending'
    },
    DB_config_PROD :
    {
        host: '127.0.0.1', 
        user:'root', 
        password: 'root',
        connectionLimit: 5
    },
    payServerUrl : 'https://test.yallvend.com',
    vendingTimezoneArr : 
    {
        901 : 'Asia/Taipei',
        764 : 'Asia/Bangkok',
        458 : 'Asia/Kuala_Lumpur'
    },
    productImageUrl : 'https://pay.yallvend.com/img/line_pay_anchor.png',
    productName : '販賣機商品',
    currencyArr : 
    {
        901 : 'TWD',
        458 : 'MYR'
    },
};