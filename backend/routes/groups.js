import express from "express";
import { auth } from "../middleware/auth.js";
import Group from "../models/Group.js";

const router = express.Router();

// Create group
router.post("/", auth, async (req, res) => {
  try {
    const group = new Group({
      ...req.body,
      creator: req.user._id,
      members: [{ user: req.user._id, role: "admin" }],
    });

    await group.save();
    req.user.groups.push(group._id);
    await req.user.save();

    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all public groups
router.get("/discover", async (req, res) => {
  try {
    const groups = await Group.find({ privacy: "public" })
      .populate("creator", "name avatar")
      .populate("members.user", "name avatar")
      .sort({ totalScore: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's groups
router.get("/", auth, async (req, res) => {
  try {
    await req.user.populate({
      path: "groups",
      populate: [
        { path: "creator", select: "name avatar" },
        { path: "members.user", select: "name avatar" },
      ],
    });
    res.json(req.user.groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get group by id
router.get("/:id", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("creator", "name avatar")
      .populate("members.user", "name avatar");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join group
router.post("/:id/join", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.privacy === "private") {
      return res.status(403).json({ error: "This is a private group" });
    }

    const isMember = group.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ error: "Already a member" });
    }

    group.members.push({ user: req.user._id });
    await group.save();

    req.user.groups.push(group._id);
    await req.user.save();

    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Leave group
router.post("/:id/leave", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const memberIndex = group.members.findIndex(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (memberIndex === -1) {
      return res.status(400).json({ error: "Not a member of this group" });
    }

    if (group.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "Creator cannot leave the group" });
    }

    group.members.splice(memberIndex, 1);
    await group.save();

    req.user.groups = req.user.groups.filter(
      (groupId) => groupId.toString() !== group._id.toString()
    );
    await req.user.save();

    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
