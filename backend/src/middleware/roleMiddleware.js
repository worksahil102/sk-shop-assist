const roleMiddleWare = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoleId = req.user.roleId;

    if (!allowedRoles.includes(userRoleId)) {
      return res.status(403).json({
        success: false,
        message: " you do not have permission to access this resource",
      });
    }
    next();
  };
};

module.exports = roleMiddleWare;
