var express = require('express');
var iPay88 = require('../controller/ipay88');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('test', { mid: 'M07105' });
});

router.get('/ipay88/pay/:vidMd5/:paymentId/:amount/:currency', iPay88.pay);
router.post('/ipay88/test', iPay88.test);
router.post('/ipay88/payRes', iPay88.payRes);
router.get('/ipay88/refund/:orderId', iPay88.refund);

module.exports = router;
