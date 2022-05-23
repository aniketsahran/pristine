const express = require("express");
const dbaseController = require('../controllers/dbase');
const router = express.Router();

router.post('/special_req', dbaseController.special_req_func);
router.post('/cleaning_req', dbaseController.cleaning_req_func);
router.post('/cleaning_req_done', dbaseController.cleaning_done_func);

module.exports = router;