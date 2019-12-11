const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

const User = require('../models/User');
const Follow = require('../models/Follow');

/**
 * @api {get} /api/v1/users/:userId/follows
 * @apiName getFollows
 * @apiGroup follows
 * @apiPermission public
 *
 * @apiDescription Get the user's following
 */
const getFollows = asyncHandler(async (req, res, next) => {
  if (req.params.userId) {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return next(
        new ErrorResponse(`No user with the id of ${req.params.userId}`, 404),
      );
    }

    const follows = await Follow.find({ follower: req.params.userId })
      .populate({
        path: 'followee',
        select: 'name photoUrl',
      })
      .select('followee');

    return res.status(200).json({ success: true, data: follows });
  }
  return res.status(400);
});

/**
 * @api {post} /api/v1/follows/:userId
 * @apiName createFollow
 * @apiGroup follows
 * @apiPermission protected
 *
 * @apiDescription Follow the user with userId
 */
const createFollow = asyncHandler(async (req, res, next) => {
  // Check that the userId is valid
  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(
      new ErrorResponse(`No user with the id of ${req.params.userId}`, 404),
    );
  }

  // Check if the follow already exists
  const follow = await Follow.findOne({
    follower: req.user.id,
    followee: req.params.userId,
  });

  if (follow) {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is already following user with id ${req.params.userId}`,
        400,
      ),
    );
  }

  // Save the authenticate user following the user with userId
  let savedFollow = await Follow.create({
    follower: req.user.id,
    followee: req.params.userId,
  });

  // Populate the followee fields
  savedFollow = await savedFollow
    .populate({
      path: 'followee',
      select: 'name photoUrl',
    })
    .execPopulate();

  // Return the data with the populated followee fields
  return res.status(201).json({ success: true, data: savedFollow.followee });
});

/**
 * @api {delete} /api/v1/follows/:userId
 * @apiName deleteFollows
 * @apiGroup follows
 * @apiPermission protected
 *
 * @apiDescription Unfollow user
 */
const deleteFollow = asyncHandler(async (req, res, next) => {
  // Check that the userId is valid
  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(
      new ErrorResponse(`No user with the id of ${req.params.userId}`, 404),
    );
  }

  // Check if the follow exists
  const follow = await Follow.findOne({
    follower: req.user.id,
    followee: req.params.userId,
  })
    .populate({
      path: 'followee',
      select: 'name photoUrl',
    })
    .select('followee');

  if (!follow) {
    return next(new ErrorResponse(`Follow does not exist`, 404));
  }

  await follow.remove();
  return res.status(200).json({ success: true, data: follow.followee });
});

/**
 * @api {put} /api/v1/follows/:userId
 * @apiName updateFollow
 * @apiGroup follows
 * @apiPermission protected
 *
 * @apiDescription Update the follow status on user with userId
 */
const updateFollow = asyncHandler(async (req, res, next) => {
  const { action } = req.query;

  // Check that the userId is valid
  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(
      new ErrorResponse(`No user with the id of ${req.params.userId}`, 404),
    );
  }

  if (action === 'unfollow') {
    const result = await Follow.findOneAndRemove({
      follower: req.user.id,
      followee: req.params.userId,
    });

    return res.status(200).json({ success: true, data: result });
  }

  // Check if the follow already exists
  const follow = await Follow.findOne({
    follower: req.user.id,
    followee: req.params.userId,
  });

  if (follow) {
    return res.status(200).json({ success: true, data: follow });
  }

  // Save the authenticate user following the user with userId
  const savedFollow = await Follow.create({
    follower: req.user.id,
    followee: req.params.userId,
  });

  // Return the data with the populated followee fields
  return res.status(201).json({ success: true, data: savedFollow });
});

module.exports = {
  getFollows,
  createFollow,
  deleteFollow,
  updateFollow,
};
