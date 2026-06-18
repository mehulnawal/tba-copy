const Announcement = require("../models/announcement.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getActiveAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({ isActive: true }).sort({
    order: 1,
    createdAt: -1,
  });

  res.status(200).json(
    new ApiResponse(200, announcements, "Active announcements fetched successfully"),
  );
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const { message, order, isActive } = req.body;

  if (!message) {
    throw new ApiError(400, "Announcement message is required");
  }

  const announcement = await Announcement.create({
    message,
    order: order || 0,
    isActive: isActive !== undefined ? isActive : true,
    createdBy: req.admin._id,
  });

  res.status(201).json(
    new ApiResponse(201, announcement, "Announcement created successfully"),
  );
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const { announcementId } = req.params;

  const announcement = await Announcement.findById(announcementId);
  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  if (req.body.message !== undefined) announcement.message = req.body.message;
  if (req.body.order !== undefined) announcement.order = req.body.order;

  await announcement.save();

  res.status(200).json(
    new ApiResponse(200, announcement, "Announcement updated successfully"),
  );
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { announcementId } = req.params;

  const announcement = await Announcement.findByIdAndDelete(announcementId);
  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  res.status(200).json(
    new ApiResponse(200, null, "Announcement deleted successfully"),
  );
});

const listAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find().sort({
    order: 1,
    createdAt: -1,
  });

  res.status(200).json(
    new ApiResponse(200, announcements, "Announcements fetched successfully"),
  );
});

const activateAnnouncement = asyncHandler(async (req, res) => {
  const { announcementId } = req.params;

  const announcement = await Announcement.findByIdAndUpdate(
    announcementId,
    { isActive: true },
    { new: true },
  );

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  res.status(200).json(
    new ApiResponse(200, announcement, "Announcement activated successfully"),
  );
});

const deactivateAnnouncement = asyncHandler(async (req, res) => {
  const { announcementId } = req.params;

  const announcement = await Announcement.findByIdAndUpdate(
    announcementId,
    { isActive: false },
    { new: true },
  );

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  res.status(200).json(
    new ApiResponse(200, announcement, "Announcement deactivated successfully"),
  );
});

module.exports = {
  getActiveAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  activateAnnouncement,
  deactivateAnnouncement,
};
