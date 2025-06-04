let ipMap = new Map()


module.exports = (options) => {
    return function(req, res, next) {
        if(!options.max || !options.reset) return res.status(500).send("Error durring rate limiter middleware")
        const maxRequests = options.max
        const resetTime = options.reset
        const ip = req.ip
        const path = req.path 
        const key = `${ip}:${path}`
        if(ipMap.has(key)) {
            const ipObject = ipMap.get(key)
            const currentTime = Date.now()
            const timePassed = currentTime - ipObject.startTime
            if(timePassed > resetTime) {
                ipMap.set(key, { count: 1, startTime: Date.now})
                console.log("We reset user count")
            } else {
                ipMap.set(key, { count: ipObject.count +1, startTime: ipObject.startTime})
                console.log("We add 1 to the user")
                if(ipMap.get(key).count > maxRequests) {
                    console.log(`User ${ip} spammed on ${path}`)
                    res.status(429).send("Spam detected")
                    return
                }
            }
        } else {
            ipMap.set(key, {count: 1, startTime: Date.now()})
            console.log("We add the user to the map")
        }
        next()
    }
};