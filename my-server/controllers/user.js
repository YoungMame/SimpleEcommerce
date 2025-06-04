const UserModel = require("../models/user");
const { requestProducts } = require("./product.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

function isValidEmail(email) {      
    const emailRegex = /^[a-z0-9._%-]+@[a-z]+.[a-z]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    const hasUpperCaseRegex = /[A-Z]/
    const hasLowerCaseRegex = /[a-z]/
    if(password.length < 12 || hasUpperCaseRegex.test(password) === false || hasLowerCaseRegex.test(password) === false) {
        return false
    } else return true
}

function generateRandomPassword() {                        // par chatGPT MERCIIII
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialCharacters = '!@#$%^&*()_+[]{}|;:,.<>?';
    
    const passwordLength = 12;
    let password = '';
    
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialCharacters[Math.floor(Math.random() * specialCharacters.length)];
    
    const allCharacters = lowerCase + upperCase + numbers + specialCharacters;
    for (let i = password.length; i < passwordLength; i++) {
        password += allCharacters[Math.floor(Math.random() * allCharacters.length)];
    }
    
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    return password;
}

function isValidBirthdate(arg) {
    const date = new Date(arg)
    if(isNaN(date.getTime())) return false
    const now = new Date(Date.now())
    let years = now.getFullYear() - date.getFullYear()
    m = now.getMonth() - date.getMonth()
    if(m < 0 || now.getDate() < date.getDate()) {
        years --
    }
    if(years < 13 || years > 120) {
        return false
    } else return true
}

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true, 
    auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASSWORD
    }
})

module.exports.signup = async (req, res) => {
    const body = req.body
    if(!isValidPassword(body.password)) return res.status(400).send("invalid_password")
    if(!isValidEmail(body.email)) return res.status(400).send("invalid_email")
    if(!isValidBirthdate(body.birthdate)) return res.status(400).send("invalid_birthdate")
    const result = await UserModel.findOne({
        email: body.email
    })
    const passwordHash = await bcrypt.hash(body.password, 10)
    if(result) {
        res.status(409).send("existing_account")
    } else {
        try {
            const user = new UserModel({
                email: body.email,
                password: passwordHash,
                admin: false,
                firstname: body.firstname,
                lastname: body.lastname,
                birthdate: new Date(body.birthdate)
            })
            user.save().then(() => {
                console.log(`Signup successfull for ${body.email}`)
                res.status(201).send("success")
            }).catch((error) => {
                throw new Error(error)
            })
        } catch (error) {
            res.status(500).send(error)
        }
    }
}

module.exports.login = async (req, res) => {
    try {
        const body = req.body;
        const token = req.headers.authorization?.split(" ")[1];

        if (token) {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            if (decodedToken.id) {
                const user = await UserModel.findOne({ email: decodedToken.email });
                if (user) {
                    return res.status(200).json({
                        jwt: token,
                        admin: user.admin,
                        validated: user.validated,
                        email: user.email,
                        birthdate: user.birthdate,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        lang: user.lang,
                        phone: user.phone
                    });
                }
            }
        }

        if (body) {
            const user = await UserModel.findOne({ email: body.email });
            if (!user) {
                return res.status(404).send("non_existing_user");
            }

            const valid = await bcrypt.compare(req.body.password, user.password);
            if (valid) {
                const payload = {
                    id: user._id,
                    email: user.email,
                    admin: user.admin,
                    validated: user.validated
                };

                return res.status(200).json({
                    jwt: jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "72h" }),
                    admin: user.admin,
                    validated: user.validated,
                    email: user.email,
                    birthdate: user.birthdate,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    lang: user.lang,
                    phone: user.phone
                });
            } else {
                return res.status(401).send("wrong_password");
            }
        }

        return res.status(404).send("non_existing_user");

    } catch (error) {
        console.log(error);
        return res.status(500).send("server_error");
    }
};


module.exports.requestValidation = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if(token) {
            const verificationUrl = `${req.protocol}://${req.get("host")}/api/user/verify-user?token=${token}`;
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            if(decodedToken.id) {
                const mailOptions = {
                    from: process.env.MAIL_AUTH_USER,
                    to: decodedToken.email,
                    subject: "M'La Brocante : email de validation",
                    html: `<p>Un compte sur mlabrocante.fr a été créé avec cette adresse-email, confirmez qu'il s'agit de vous en appuyant sur ce bouton. Si ce n'est pas le cas alors contactez nous sur mlabrocante.fr<a href="${verificationUrl}">Confirmer</a></p>`
                }
                const success = await transporter.sendMail(mailOptions);
                if (success)
                    res.status(200).send("request_validation_email_success");
                else
                    throw "request_validation_email_error";
            }
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

module.exports.requestForgotten = async (req, res) => {
    try {
        const { email } = req.params;
        
        if (!email) {
            return res.status(400).send("no_email"); // Assure que la réponse est envoyée si pas d'email
        }

        const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Pas de .id dans decodedToken, on vérifie l'email à la place
        const newPassword = generateRandomPassword();
        if (decodedToken.email) {
            const mailOptions = {
                from: process.env.MAIL_AUTH_USER,
                to: decodedToken.email,
                subject: "M'La Brocante : Your new password",
                html: `<p>Here is you new password: <strong>${newPassword}</strong></p>`
            };

            const success = await transporter.sendMail(mailOptions);
            
            if (success) {
                const passwordHash = await bcrypt.hash(newPassword, 10);
                await UserModel.updateOne({ email: decodedToken.email }, { $set: { password: passwordHash } });
                return res.status(200).send("success"); // Répondre avec succès si l'email a été envoyé
            } else {
                throw new Error("Failed to send email");
            }
        }
    } catch (error) {
        return res.status(500).send(error.message || "An error occurred");
    }
};

module.exports.validateEmail = async (req, res) => {
    try {
        const token = req.query.token;
        if (!token) {
            return res.status(400).send("expired_token");
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (decodedToken.id) {
            await UserModel.updateOne(
                { _id: decodedToken.id },
                { validated: true }
            );
            const adminEmailRegex = /^[a-z0-9._%-]+@mlabrocante.fr$/;
            if (adminEmailRegex.test(decodedToken.email)) {
                await UserModel.updateOne(
                    { _id: decodedToken.id },
                    { admin: true }
                );
            }

            return res.status(200).send("validate_email_success");
        } else {
            throw new Error("Invalid token payload");
        }
    } catch (error) {
        console.error("Error in validateEmail:", error.message);
        return res.status(500).send(error.message || "Internal server error");
    }
};


module.exports.editPassword = async (req, res) => {
    try {
        const body = req.body;
        if (!body.newpassword || !isValidPassword(body.newpassword)) {
            return res.status(401).send("new_password_not_valid");
        }
        const token = req.headers.authorization?.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken.email) {
            return res.status(401).send("no_jwt");
        }
        const user = await UserModel.findOne({ email: decodedToken.email });
        if (!user) {
            return res.status(404).send("non_existing_user");
        }
        const valid = await bcrypt.compare(body.oldpassword, user.password);
        if (!valid) {
            return res.status(401).send("old_password_not_valid");
        }
        const passwordHash = await bcrypt.hash(body.newpassword, 10);
        await UserModel.updateOne({ email: decodedToken.email }, { $set: { password: passwordHash } });
        res.status(200).send("update_password_success");
    } catch (error) {
        res.status(500).send(error.message);
    }
}


module.exports.editUser = async (req, res) => {
    try {
        const body = req.body;
        const token = req.headers.authorization?.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findOne({ email: decodedToken.email });
        if (!user) return res.status(404).send("not_existing_user");
        if(!decodedToken.email) return res.status(401).send("no_jwt");
        for (let key in body) {
            if (body.hasOwnProperty(key) && (key == "firstname" || key == "lastname" || key == "phone")) {
                const update = {};
                update[key] = body[key];
                const result = await UserModel.updateOne(
                    { email: decodedToken.email }, 
                    { $set: update }
                );
                if (!result)
                    return (res.status(500).send("server_error"));
            }
        }
        res.status(200).send("success");
    } catch (error) {
        res.status(500).send(error);
    }
}

module.exports.setAdminState = async (req, res) => {
    try {
        const body = req.body 
        const requestedEmail = body.email
        const value = body.admin
        if(!requestedEmail || value == null || value == undefined) return res.status(400)
        const updatedUser = await UserModel.updateOne({email : requestedEmail}, {admin : value})
        if(!updatedUser) return res.status(400)
        res.status(200).json(updatedUser)
    } catch (error) {
        res.status(500).send(error)
    }
}

module.exports.getUser = async (req, res) => {
    try {
        const requestedEmail = req.params.email;
        if(requestedEmail) {
            UserModel.findOne({email : requestedEmail}).then( user => {
                if(!user) return res.status(404).send("non_existing_user")
                res.status(200).json(user)
            }).catch(error => { throw error })
        } else res.status(404).send("non_existing_user") 
    } catch (error) {
        res.status(500).send(error)
    }
}

module.exports.getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) ;
        const search = req.query.search.toLowerCase() || "";
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        let users = await UserModel.find({});
        users = users.filter(user => {
            return (user.email.includes(search));
        })
        users = users.slice(startIndex, endIndex);
        if(!users) return res.status(404).send("no_user");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).send(error);
    }
}

module.exports.deleteUser = (req, res) => {
    const body = req.body 
    try {
        if(body?.email) {
            UserModel.deleteOne({email: body.email}).then(result => {
                res.status(202).send("Account deleted")
            }).catch(error => {throw new Error(error)})
        } else res.status(401).send("No email in the body")
    } catch (error) {
        res.status(500).send(error)
    }
}

module.exports.getCart = async (req, res) => {
    try {
        const products = requestProducts();
        const token = req.headers.authorization?.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findOne({ email: decodedToken.email });
        let updatedCart;
        if (!user)
            throw "no_user_found";
        if (Array.isArray(user.cart)) {
            updatedCart = user.cart.map(cartItem => {
                const existingProduct = products.find(item => item._id === cartItem.productId);
                if (existingProduct) {
                    return {
                        quantity: cartItem.quantity,
                        productId: cartItem.productId,
                        price: existingProduct.price,
                        title: existingProduct.title,
                        image: existingProduct.pictures[0] ? existingProduct.pictures[0] : null
                    };
                }
                else return null;
            });
            updatedCart = updatedCart.filter(item => item !== null);
        }
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports.addToCart = async (req, res) => {
    try {
        const products = requestProducts();
        let { productId, quantity } = req.body;
        const token = req.headers.authorization?.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findOne({ email: decodedToken.email });
        if (!user)
            throw "no-user-found";
        if (!productId || !quantity || quantity < 1 )
            return res.status(406).send("not-valid-quantity");
        if (!user.cart)
            user.cart = [];
        const existingCartItem = user.cart.find(item => item.productId === productId);
        const existingProduct = products.find(item => item._id === productId);
        if (!existingProduct)
            return res.status(406).send("no-product");
        if (!existingProduct.deliveryWeight)
            return res.status(403).send("delivery-not-available");
        if (existingCartItem) {
            const newQuantity = existingCartItem.quantity + quantity;
            existingCartItem.quantity = Math.min(newQuantity, existingProduct.quantity);
        } else {
            const newQuantity = Math.min(existingProduct.quantity, quantity);
            user.cart.push({ productId: productId, quantity: newQuantity });
        }
        await user.save();
        return res.status(200).send("product-added-to-cart");
    } catch (error) {
        res.status(500).send(error.message || error);
    }
};

module.exports.changeCartItemQuantity = async (req, res) => {
    try {
        const products = requestProducts(); 
        const { productId, quantity } = req.body;
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) return res.status(401).send("no-jwt");
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findOne({ email: decodedToken.email });

        if (!user) 
            return res.status(404).send("user-not-found");
        if (!productId || !quantity || quantity < 1)
            return res.status(400).send("not-valid-quantity");
        if (!user.cart)
            user.cart = [];
        const existingCartItem = user.cart.find(item => item.productId === productId);
        const existingProduct = products.find(item => item._id.toString() === productId);

        if (!existingProduct) {
            return res.status(404).send("product-not-found");
        }
        if (!existingCartItem) 
            return res.status(404).send("cart-item-not-found");
        if (quantity > existingProduct.quantity) 
            return res.status(400).send("quantity-too-hight");
        existingCartItem.quantity = quantity;
        await user.save();
        return res.status(200).send("product-quantity-edited");
    } catch (error) {
        res.status(500).send(error.message || error);
    }
};

module.exports.deleteCartItem = async (req, res) => {
    try {
        const products = requestProducts();
        let { productId } = req.body;
        const token = req.headers.authorization?.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findOne({ email: decodedToken.email });
        if (!user)
            throw "no-user-found";
        if (!productId )
            return res.status(406).send("no-product");
        if (!user.cart)
            user.cart = [];
        const existingCartItemIndex = user.cart.findIndex(item => item.productId === productId);
        console.log(existingCartItemIndex)
        if (existingCartItemIndex === -1) 
            return res.status(406).send("cart-item-not-found");
        user.cart.splice(existingCartItemIndex, 1);
        await user.save();
        return res.status(200).send("product-deleted-from-cart");
    } catch (error) {
        res.status(500).send(error.message || error);
    }
};

module.exports.deleteCart = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findOne({ email: decodedToken.email });
        if (!user)
            throw "no-user-found";
        user.cart = [];
        await user.save();
        return res.status(200).send("cart-deleted");
    } catch (error) {
        res.status(500).send(error.message || error);
    }
};