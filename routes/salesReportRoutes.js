const express = require('express');
const router = express.Router();
const salesReportController = require('../controllers/salesreportController');

router.get('/daily', salesReportController.generateDailyReport);
router.get('/monthly', salesReportController.generateMonthlyReport);
router.get('/yearly', salesReportController.generateYearlyReport);

module.exports = router;
