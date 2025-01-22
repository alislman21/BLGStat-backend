const reportServices = require('../services/report.service');


exports.report = async (req, res) => {
    try {
        const report = await reportServices.report(req.user);
        console.log(report);
        res.status(200).json({
            status: "success",
            report: report
        });
    } catch (error) {
        console.log(error);
    }
}

exports.fetchReport = async (req, res) => {
    try {
        const instagramReport = await reportServices.getInstagramReport(req.user);

        const twitterReport = await reportServices.getTwitterReport(req, res);

        res.status(200).json({
            status: "success",
            instagramReport: instagramReport,
            twitterReport: twitterReport,
        });
    } catch (error) {
        console.log(error);
    }
}