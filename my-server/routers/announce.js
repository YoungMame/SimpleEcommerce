const express = require("express")

const router = express.Router()

const { createAnnounce, getAnnounces, deleteAnnounce, editAnnounce } = require("../controllers/announce")

const { imgUpload } = require("../middlewares/files")
const admin = require("../middlewares/auth")

router.post("/", admin, imgUpload, createAnnounce)

router.patch("/:id", admin, imgUpload, editAnnounce)

router.delete("/:id", admin, deleteAnnounce)

router.get("/", getAnnounces)
module.exports = router