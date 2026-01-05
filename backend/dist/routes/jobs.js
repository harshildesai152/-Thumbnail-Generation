"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jobController_1 = require("../controllers/jobController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, jobController_1.JobController.getUserJobs);
router.get('/:jobId', auth_1.authenticate, jobController_1.JobController.getJobById);
exports.default = router;
//# sourceMappingURL=jobs.js.map