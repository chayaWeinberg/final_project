/**
 * Middleware: allow access only for employees and admins.
 * Admins have full access everywhere, employees only to employee routes.
 */
function employeeOrAdmin(req, res, next) {
    const role = req.user?.role;
    if (role !== 'employee' && role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
}

module.exports = employeeOrAdmin;
