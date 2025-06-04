const express = require("express");

const router = express.Router();

const {
    signup,
    login,
    editPassword,
    editUser,
    getUser,
    getUsers,
    setAdminState,
    deleteUser,
    requestValidation,
    validateEmail,
    requestForgotten,
    getCart,
    addToCart,
    changeCartItemQuantity,
    deleteCartItem,
    deleteCart
} = require("../controllers/user");

const authMiddleware = require("../middlewares/auth.js");
const adminMiddleware = require("../middlewares/admin.js");

router.post("/signup", signup);
router.post("/login", login);
router.post("/request-forgotten/:email", requestForgotten);
router.get("/verify-user", validateEmail);
router.use(authMiddleware); 
router.get("/cart", getCart);
router.post("/cart", addToCart);
router.patch("/cart", changeCartItemQuantity);
router.delete("/cart", deleteCartItem);
router.delete("/delete-cart", deleteCart);
router.patch("/password", editPassword);
router.patch("/", editUser);
router.delete("/", deleteUser);
router.patch("/set-admin", adminMiddleware, setAdminState);
router.post("/request-validation", requestValidation);
router.get("/", getUsers);
router.get("/:email", getUser);

module.exports = router;
