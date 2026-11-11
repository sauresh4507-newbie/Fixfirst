const asyncHandler = require('../utils/asyncHandler');
const { analyzeIssue, getTroubleshootingResponse, AI_MODE } = require('../services/aiService');
const DeviceRepairRequest = require('../models/DeviceRepairRequest');

// @desc    Analyze a device issue
// @route   POST /api/ai/analyze-issue
// @access  Private
const analyzeDeviceIssue = asyncHandler(async (req, res) => {
  const { deviceCategory, deviceBrand, deviceModel, issueCategory, issueDescription, repairRequestId } = req.body;

  if (!deviceCategory || !issueCategory || !issueDescription) {
    return res.status(400).json({
      success: false,
      message: 'Device category, issue category, and description are required.',
    });
  }

  const analysis = await analyzeIssue({
    deviceCategory,
    deviceBrand,
    deviceModel,
    issueCategory,
    issueDescription,
  });

  // Optionally save to repair request
  if (repairRequestId) {
    await DeviceRepairRequest.findOneAndUpdate(
      { _id: repairRequestId, customer: req.user._id },
      {
        aiAnalysis: { ...analysis, analyzedAt: new Date() },
        status: analysis.professionalRepairRecommended ? 'awaiting_quotations' : 'troubleshooting',
        troubleshootingStatus: analysis.professionalRepairRecommended ? 'escalated' : 'in_progress',
        isPublic: analysis.professionalRepairRecommended,
      }
    );
  }

  res.json({
    success: true,
    aiMode: AI_MODE,
    analysis,
  });
});

// @desc    Get a troubleshooting chat response
// @route   POST /api/ai/troubleshoot
// @access  Private
const troubleshoot = asyncHandler(async (req, res) => {
  const { messages, deviceContext, repairRequestId } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Messages array is required.',
    });
  }

  if (!deviceContext) {
    return res.status(400).json({
      success: false,
      message: 'Device context is required.',
    });
  }

  const response = await getTroubleshootingResponse(messages, deviceContext);

  res.json({
    success: true,
    aiMode: AI_MODE,
    response,
  });
});

module.exports = { analyzeDeviceIssue, troubleshoot };
