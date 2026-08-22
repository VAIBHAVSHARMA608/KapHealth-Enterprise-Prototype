const HealthRecord = require("../models/HealthRecord");

async function uploadRecord(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const { title, recordType, recordDate, notes, forDependentId, forDependentName } = req.body;

    const record = await HealthRecord.create({
      patient: req.user.id,
      title: title || req.file.originalname,
      recordType: recordType || "other",
      fileUrl: `/uploads/health-records/${req.file.filename}`,
      recordDate: recordDate || undefined,
      notes,
      uploadedBy: "patient",
      forDependentId: forDependentId || null,
      forDependentName: forDependentName || null,
    });

    res.status(201).json({ record });
  } catch (err) {
    next(err);
  }
}

async function listMyRecords(req, res, next) {
  try {
    const { recordType, forDependentId } = req.query;
    const filter = { patient: req.user.id };
    if (recordType) filter.recordType = recordType;
    if (forDependentId) filter.forDependentId = forDependentId;
    const records = await HealthRecord.find(filter).sort({ recordDate: -1 });
    res.json({ records });
  } catch (err) {
    next(err);
  }
}

async function deleteRecord(req, res, next) {
  try {
    const record = await HealthRecord.findOneAndDelete({ _id: req.params.id, patient: req.user.id });
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadRecord, listMyRecords, deleteRecord };
