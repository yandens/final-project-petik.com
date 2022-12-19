const router = require("express").Router();
const getNotification = require("../controllers/notification");
const authorize = require("../middlewares/authorize");

router.get("/", authorize(), getNotification.getNotification);

module.exports = router;
