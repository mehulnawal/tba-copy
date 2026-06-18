const ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "superAdmin",
  BUSINESS: "vendor",
};

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

module.exports = { ROLES, ADMIN_ROLES };
