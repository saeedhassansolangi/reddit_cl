exports.flash_messages = function (req, res, next) {
        res.locals.error = req.flash("error");
        res.locals.success = req.flash("success");
        res.locals.info = req.flash("info");
        res.locals.primary = req.flash("primary");
        next();
}

