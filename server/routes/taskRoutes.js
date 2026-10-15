const express = require("express");
const controller = require("../controllers/taskController");

const router = express.Router();

router.get("/", controller.listTasks);
router.post("/", controller.createTask);
router.get("/:id", controller.getTask);
router.put("/:id", controller.updateTask);
router.patch("/:id/status", controller.updateStatus);
router.delete("/:id", controller.deleteTask);

module.exports = router;
