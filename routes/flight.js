const router = require("express").Router();
const flight = require("../controllers/flight");
const authorize = require("../middlewares/authorize");
const role = require("../utils/role-based/role");

router.get("/schedule", flight.showFlight);
router.post("/schedule/search", flight.showFilter);
router.post("/create-flight", authorize(role.admin), flight.createFlight.createFlightAdmin);
router.put("/edit/:flight_id", authorize(role.admin), flight.updateFlight);
router.delete("/delete/:flight_id", authorize(role.admin), flight.deleteFlight.deleteFlightAdmin);
router.get("/get-flight/:flight_id", authorize(role.admin), flight.getFlight)

module.exports = router;
