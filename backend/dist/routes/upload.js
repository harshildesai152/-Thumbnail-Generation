"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, uploadController_1.UploadController.uploadMiddleware, upload_1.handleUploadError, uploadController_1.UploadController.uploadFiles);
exports.default = router;
//# sourceMappingURL=upload.js.map