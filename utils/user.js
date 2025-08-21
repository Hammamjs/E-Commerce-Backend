const userObject = (user) => {
  return {
    username: user.username,
    email: user.email,
    _id: user._id,
    role: user.role,
    address: user.address,
    phone: user.phone,
    bio: user.bio,
    profileImg: user.profileImg,
  };
};

export default userObject;
