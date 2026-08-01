const Certificate = require("../models/certificate.model");

const CERTIFICATE_OPTIONS = [
  {
    name: "IGI Diamond Certification (IGI)",
    logoUrl: "/certificates/IGILogo.png",
  },
  { name: "Hallmarking", logoUrl: "/certificates/IGILogo.png" },
  {
    name: "Gemological Centers Identification (GCI)",
    logoUrl: "/certificates/IGILogo.png",
  },
];

const synchronizeCertificates = async () => {
  const options = CERTIFICATE_OPTIONS.map(({ name, logoUrl = "" }) => ({
    name: String(name || "").trim(),
    logoUrl: String(logoUrl || "").trim(),
  })).filter((option) => option.name);
  const names = options.map((option) => option.name);
  await Certificate.updateMany(
    { name: { $nin: names } },
    { $set: { isActive: false } },
  );
  await Promise.all(
    options.map((option) =>
      Certificate.findOneAndUpdate(
        { name: option.name },
        {
          $set: { logoUrl: option.logoUrl, isActive: true },
          $setOnInsert: { name: option.name },
        },
        { upsert: true, new: true, runValidators: true },
      ),
    ),
  );
};

module.exports = { CERTIFICATE_OPTIONS, synchronizeCertificates };
