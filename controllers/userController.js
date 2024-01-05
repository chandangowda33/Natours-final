//helps in uploading the files from form
const multer = require('multer');
//image processing
const sharp = require('sharp');
const User = require('./../models/userModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// const upload = multer({ dest: 'public/img/users' });

//belwo is if we need to store image directly into disk
// const multerStorage = multer.diskStorage({
//   //cb like next in express
//   destination: (req, file, cb) => {
//     //first arguement should be error message if anything occurs
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //in file object and mimetype field there will be extension
//     const ext = file.mimetype.split('/')[1];
//     //formating the file name
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

//but most user uploads large files and not squared shape files so first we save in localstorage
//then after that we can process it using sharp
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

//.single to upload single file and photo is the field name
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
  console.log(`Here in resize`);
  if (!req.file) {
    return next();
  }
  //in file object and mimetype field there will be extension
  const ext = req.file.mimetype.split('/')[1];
  //     //formating the file name
  req.file.filename = `user-${req.user.id}-${Date.now()}.${ext}`;

  console.log();

  //files we stored in memory storage will be available in buffer
  sharp(req.file.buffer)
    //above returns the object on which we can do all image processing
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.updateMe = catchAsync(async (req, res, next) => {
  //if user sends any password or change password data error it out
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route isnot for password updates.Please use/updateMyPassword',
        400
      )
    );
  }

  //here we need to enter only the fields which allows user to update
  const filterBody = filterObj(req.body, 'name', 'email');
  //updating the photo
  if (req.file) filterBody.photo = req.file.filename;
  console.log(req.file);
  //here we are not changing any sensitive data and we dont want any validators to run so we using .findbyidandupdate
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

//using this as middleware and faking the loggged in id as param id
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = factory.getAll(User);

//this is by user they can only make inactive
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};

exports.updateUser = factory.updateOne(User);

// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined',
//   });
// };

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Use Sign up!!'
  });
};

//this is by admin he can delete
exports.deleteUser = factory.deleteOne(User);
