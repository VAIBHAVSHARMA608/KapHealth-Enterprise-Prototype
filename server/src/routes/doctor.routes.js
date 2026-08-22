const router = require("express").Router();
const ctrl = require("../controllers/doctorController");
const { requireAuth, requireRole } = require("../middleware/auth");
const { validateBody } = require("../validators/validate");
const { doctorOnboardingSchema } = require("../validators/doctorValidators");
const upload = require("../middleware/upload");

// Public browse (patients don't need to be logged in to browse doctors)
router.get("/", ctrl.listApprovedDoctors);
router.get("/:doctorId", ctrl.getDoctorPublicProfile);

// Doctor-only
router.post(
  "/onboarding",
  requireAuth,
  requireRole("doctor"),
  upload.fields([
    { name: "governmentId", maxCount: 1 },
    { name: "medicalRegistrationCertificate", maxCount: 1 },
    { name: "degreeCertificate", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
  ]),
  (req, res, next) => {
    // multipart fields arrive as strings; coerce known numeric/array fields before validation
    const body = { ...req.body };
    ["registrationYear", "yearsOfExperience", "consultationFee", "heightCm", "weightKg"].forEach((k) => {
      if (body[k] !== undefined) body[k] = Number(body[k]);
    });
    ["qualifications", "specializations", "languagesSpoken", "availability"].forEach((k) => {
      if (typeof body[k] === "string") {
        try {
          body[k] = JSON.parse(body[k]);
        } catch {
          /* leave as-is, validation will catch it */
        }
      }
    });
    req.body = body;
    next();
  },
  validateBody(doctorOnboardingSchema),
  ctrl.submitOnboarding
);
router.get("/me/profile", requireAuth, requireRole("doctor"), ctrl.getMyProfile);
router.get("/me/earnings", requireAuth, requireRole("doctor"), ctrl.getMyEarnings);

module.exports = router;
