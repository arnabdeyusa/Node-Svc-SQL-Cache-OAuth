const apiProvider = require("express");
const SharedAccess = require('./../dTat-access/shared.sql');
const Routes = require('./../utilities/routes');
const asyncHandler = require('./../utilities/asyncHandler').asyncHandler;
const router = apiProvider.Router();
const sharedAccess = new SharedAccess();

/**
 * @swagger
 * 
 * /shared/all/Tatcodes:
 *  get:
 *    description: Get All Tat Codes
 *    tags: [Artifacts]
 *    responses:
 *      200:
 *        description: Success
 *   
 */
router.get(Routes.sharedRoutes.getTatCodes, asyncHandler(async (req, res)=> {
    if (parseInt(process.env.STATIC_CACHE_REFRESH) === 0) {
        await sharedAccess.getTatCodes(req, res);
    } else {
        await sharedAccess.getTatCodesFromCache(req, res);
    }
}));

module.exports = router;