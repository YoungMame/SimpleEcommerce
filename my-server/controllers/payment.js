const useStripe = require("stripe");
const UserModel = require("../models/user.js");
const OrderModel = require("../models/order.js");
const { requestProducts } = require("../controllers/product.js");
const jwt = require("jsonwebtoken");
const shippingPrices = require("../assets/shipping_prices.json");
const shippingZones = require("../assets/shipping_zones.json");

const stripe = useStripe(process.env.STRIPE_SECRET_KEY);

const getCartDescription = (cart, address) => {
    const cartDescription = cart.map(product => `x${product.quantity} ${product.title} (${product.productCode}): ${product.price} EUROS\n`);
    const addressDescription = `${address.line1}, ${address.zipCode} ${address.city}\n details: ${JSON.stringify(address)}`;
    return `${cartDescription} ${addressDescription}`
};

const getCountryCode = async (address) => {
    const addressString = `${address.line1}, ${address.zipCode} ${address.city}`;
    const apiKey = process.env.HERE_API_KEY; 
    const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(addressString)}&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(JSON.stringify(data));
        
        if (data.items && data.items.length > 0) {
            const country = data.items[0].address.countryCode; 
            console.log(country)
            return country || null; 
        }
        return null;
    } catch (error) {
        console.error("Error during address definition:", error);
        return null;
    }
};

const getDeliveryPrice = (shippingZone, formule, weight) => {
    const priceObj = shippingPrices[shippingZone][formule];
    let price = null;

    for (let key in priceObj) {
        if (parseInt(key) > weight) break;
        price = priceObj[key]; 
    }
    return price || null;
};

const getShippingZone = (countryCode, postalCode) => {
    postalCode = postalCode.replace(/\s+/g, '');
    const postalPrefix = (countryCode === "FRA" && postalCode.length >= 2) ? postalCode.slice(0, 2) : postalCode.slice(0, 3);

    if (shippingZones[countryCode]?.includes(postalPrefix)) return countryCode;
    if (countryCode === "FR") {
        if (shippingZones.OM1?.includes(postalPrefix)) return "OM1";
        if (shippingZones.OM2?.includes(postalPrefix)) return "OM2";
    }
    return null;
};

const handleStripeError = (error) => {
    if (error.type === 'StripeCardError') return "card-error";
    if (error.type === 'StripeInvalidRequestError') return "invalid-card";
    if (error.type === 'StripeAPIError') return "stripe-api-error";
    if (error.type === 'StripeConnectionError') return "stripe-connection-error";
    if (error.type === 'StripeAuthenticationError') return "stripe-auth-error";
    return error.type;
};

module.exports.calculateTotalPrice = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findOne({ email: decodedToken.email });
        
        if (!user) return res.status(406).send("no-user");
        if (!user.cart.length) return res.status(406).send("no-cart");

        const { address } = req.body;
        if (!address || !address.lastName || !address.firstName || !address.line1 || !address.city || !address.zipCode || !address.phone)
            return res.status(406).send("address-not-valid");

        const countryCode = await getCountryCode(address);
        if (!countryCode) return res.status(406).send("address-not-valid");
        
        const shippingZone = getShippingZone(countryCode, address.zipCode);
        if (!shippingZone) return res.status(406).send("address-not-valid");

        let productsPrice = 0;
        let deliveryPrice = 0;
        const cart = [];

        for (const item of user.cart) {
            const existingProduct = requestProducts().find(p => p._id == item.productId);
            if (!existingProduct) continue;

            const newQuantity = Math.min(existingProduct.quantity || item.quantity);
            const itemDeliveryPrice = getDeliveryPrice(shippingZone, "aller", existingProduct.deliveryWeight);
            if (!itemDeliveryPrice) throw "Error during shipping price definition";

            cart.push({
                title: existingProduct.title,
                price: existingProduct.price,
                productCode: existingProduct.productCode,
                deliveryWeight: existingProduct.deliveryWeight,
                quantity: newQuantity,
                image: existingProduct.pictures[0] || null
            });

            productsPrice += existingProduct.price * newQuantity;
            deliveryPrice += itemDeliveryPrice * newQuantity;
        }

        const totalPrice = (productsPrice + deliveryPrice);
        res.status(200).send({ totalPrice, deliveryPrice, productsPrice, cart, address });
    } catch (error) {
        const errorMsg = handleStripeError(error);
        res.status(500).send(errorMsg || error.message);
    }
};

module.exports.createPaymentIntent = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findOne({ email: decodedToken.email });
        
        if (!user) return res.status(406).send("no-user");
        if (!user.cart.length) return res.status(406).send("no-cart");

        const { address } = req.body;
        if (!address || !address.lastName || !address.firstName || !address.line1 || !address.city || !address.zipCode || !address.phone)
            return res.status(406).send("address-not-valid");

        const countryCode = await getCountryCode(address);
        if (!countryCode) return res.status(406).send("address-not-valid");
        
        const shippingZone = getShippingZone(countryCode, address.zipCode);
        if (!shippingZone) return res.status(406).send("address-not-valid");

        let productsPrice = 0;
        let deliveryPrice = 0;
        const cart = [];

        for (const item of user.cart) {
            const existingProduct = requestProducts().find(p => p._id == item.productId);
            if (!existingProduct) continue;

            const newQuantity = Math.min(existingProduct.quantity || item.quantity);
            const itemDeliveryPrice = getDeliveryPrice(shippingZone, "aller", existingProduct.deliveryWeight);
            if (!itemDeliveryPrice) throw "Error during shipping price definition";

            cart.push({
                title: existingProduct.title,
                price: existingProduct.price,
                productCode: existingProduct.productCode,
                deliveryWeight: existingProduct.deliveryWeight,
                quantity: newQuantity,
                image: existingProduct.pictures[0] || null
            });

            productsPrice += existingProduct.price * newQuantity;
            deliveryPrice += itemDeliveryPrice * newQuantity;
        }
        let customer;
        if (!user.stripeCustomerId) {
            customer = await stripe.customers.create({
                name: `${user.firstname} ${user.lastname}`,
                email: user.email,
                phone: user?.phone,
                address: {
                    line1: address.line1,
                    line2: address.line2,
                    city: address.city,
                    postal_code: address.zipCode,
                    country: address.country,
                }
            });
        }
        const totalPrice = (productsPrice + deliveryPrice) * 100; 
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalPrice,
            currency: "eur",
            capture_method: 'manual', 
            description: getCartDescription(cart, address),
            automatic_payment_methods: { enabled: true },
            customer: (customer ? customer?.id : undefined)
        });

        console.log(paymentIntent);
        res.status(200).send({ clientSecret: paymentIntent.client_secret }); 
    } catch (error) {
        res.status(500).send(error.message || error);
    }
};

//        const errorMsg = handleStripeError(error);
