const jwt = require("jsonwebtoken")

async function verifyAdmin(req, res, next) {
    let token = req.headers.authorization
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET_KEY_ADMIN)
            next()
        } catch (error) {
            res.status(401).send({ result: "Fail", message: "Token Verification Fail. Possible Reasons 1. Login Required 2. This API is For Admin and Your Account is Buyer Account" })
        }
    }
    else
        res.status(401).send({ result: "Fail", message: "You Are Not Authorized Person to Access This API" })
}

async function verifyBoth(req, res, next) {
    let token = req.headers.authorization
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET_KEY_ADMIN)
            next()
        } catch (error) {
            try {
                jwt.verify(token, process.env.JWT_SECRET_KEY_BUYER)
                next()
            } catch (error) {
                res.status(401).send({ result: "Fail", message: "Token Verification Fail. Login Required" })
            }
        }
    }
    else
        res.status(401).send({ result: "Fail", message: "You Are Not Authorized Person to Access This API" })
}

module.exports = {
    verifyAdmin: verifyAdmin,
    verifyBoth:verifyBoth
}