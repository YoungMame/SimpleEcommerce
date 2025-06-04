const express = require("express")

const router = express.Router()

const { createProduct, getProducts, getFeaturedProducts, deleteProduct, editProduct, getProduct } = require("../controllers/product")

const auth = require("../middlewares/auth")
const { imgsUpload } = require("../middlewares/files")
const admin = require("../middlewares/auth")

router.post("/", admin, imgsUpload, createProduct)

router.patch("/:id", admin, imgsUpload, editProduct)

router.delete("/:id", admin, deleteProduct)

router.get("/", getProducts)

router.get("/featured", getFeaturedProducts)

router.get("/:id", getProduct)

module.exports = router