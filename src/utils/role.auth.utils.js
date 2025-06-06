/**
 * Middleware to restrict access based on user roles.
 * - Verifies the user has one of the allowed roles.
 *
 * @param {Array|string} roles - A single role or array of roles allowed to access the route.
 * @returns {Function} Express middleware function.
 */
export const requireRole = (roles = []) => {
  return async (req, res, next) => {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (!userRole) {
      return res.status(403).json({ message: "No role found for user." });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Access denied. Role not authorized." });
    }

    if (userRole === "admin" && userId !== 1) {
      return res
        .status(403)
        .json({ message: "Only the primary admin is authorized." });
    }

    next();
  };
};
