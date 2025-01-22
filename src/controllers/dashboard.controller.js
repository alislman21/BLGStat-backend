const dashboardService = require('../services/dashboard.service');

exports.fetch = async (req, res, next) => {
    try {
        const dashboard = await dashboardService.getDashboard(req.user);
        res.status(200).json({
            status: "success",
            dashboard: dashboard
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
}