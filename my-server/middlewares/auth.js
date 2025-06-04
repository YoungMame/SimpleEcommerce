const jwt = require("jsonwebtoken")
module.exports = function isAuth(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        if (decodedToken.id) {
            next()
        } else res.status(401).send("not_connected")
    } catch (error) {
        res.status(500).send(error)
    }
}