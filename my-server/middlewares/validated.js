const jwt = require("jsonwebtoken")
module.exports = function isValidated(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        if (decodedToken.validated) {
            next()
        } else res.status(401).send("account_not_validated");
    } catch (error) {
        res.status(500).send(error)
    }
}