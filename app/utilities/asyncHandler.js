// catch any promise error in the API
const asyncHandler = fn=>
(req, res, next) => {
    Promise.resolve(fn(req, res, next))
    .catch(next);
};

module.exports = {asyncHandler};