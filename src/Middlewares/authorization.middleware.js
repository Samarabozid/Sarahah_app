 


export const authorizationMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        const { user: { role } } = req.loggedInUser; //loggedInUser => {user:{role}}
        if (allowedRoles.includes(role)) {
            return next();
        }
        return next(new Error("Unauthorized", { cause: 401 }));
    }
}