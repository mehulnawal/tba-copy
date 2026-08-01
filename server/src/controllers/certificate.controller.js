const Certificate = require("../models/certificate.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const list = asyncHandler(async (req,res) => res.json(new ApiResponse(200, await Certificate.find({ isActive: true }).sort({ name: 1 }).lean(), "Certificates fetched")));
const save = asyncHandler(async (req,res) => { const name = String(req.body.name || "").trim(); if (!name) throw new ApiError(400,"Certificate name is required"); const item = await Certificate.findOneAndUpdate({ name }, { $set: { logoUrl: String(req.body.logoUrl || "").trim(), isActive: req.body.isActive !== false }, $setOnInsert: { name } }, { upsert: true, new: true, runValidators: true }); res.status(201).json(new ApiResponse(201,item,"Certificate saved")); });
const remove = asyncHandler(async (req,res) => { const item = await Certificate.findByIdAndDelete(req.params.certificateId); if (!item) throw new ApiError(404,"Certificate not found"); res.json(new ApiResponse(200,null,"Certificate deleted")); });
module.exports = { list, save, remove };
