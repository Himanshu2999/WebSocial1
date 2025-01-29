const exp = require('express')
const jwt = require('jsonwebtoken')
let rouk = exp.Router();
const cont = require('./controls');
const { Route } = require('react-router-dom');

/* function verifytoken(req, res, next) {
    if (!req.headers.authorization) {
        return next()
        res.send({ status: 404, msg: "Unauthorized Subject" })
    }
    let token = req.headers.authorization.split(' ')[1];
    if (token === null) {
        return next()
        res.send({ status: 404, msg: "Unauthorized Subject" })
    }
    let payload = jwt.verify(token, process.env.TOKEN_JSON)
    if (!payload) {
        res.send({ status: 404, msg: "Unauthorized Subject" })
        return next()
    }
    next()
} */

function verifyToken(req, res, next) {
    if (!req.headers.authorization) {
        res.status(401).send('Unauthorized subject');
    }

    let token = req.headers.authorization.split(' ')[1];
    if (token == 'null') {
        // Token is null, return error and stop further processing
        return res.status(401).send('Unauthorized request');
    }
    let payload = jwt.verify(token, process.env.TOKEN_JSON);
    if (!payload) {
        return res.status(401).send('Unauthorized request');
    }
    next()
}


rouk.post("/check", cont.accountsubmit)
rouk.post("/mail", cont.send_email)
rouk.post("/login", cont.log)
rouk.post("/forgmail", cont.forgmail)
rouk.put("/reforg/:tok", cont.reforg)
rouk.put("/changforg/:tok", cont.changforg)
rouk.put("/follow", cont.follow)
rouk.put("/unfollow", cont.unfollow)
rouk.get("/profData/:uname", cont.profData)
rouk.get("/fetchcatg", cont.fetchcatg)
rouk.get("/fetchsubcatg/:cat", cont.fetchsubpcat)
rouk.get("/fetchposts/:indt", cont.fetchposts)
rouk.get("/postData/:idbt", cont.postbyid)
rouk.put("/postedit/:idbt", cont.edittext)
rouk.put("/changepass", cont.changpass)
rouk.get("/restartuser/:idk", cont.restartuser)
rouk.get("/getuserposts/:userid", cont.userposts)
rouk.put("/textstatus/:idk", cont.textstatus)
rouk.put("/rmvstatus/:idk", cont.rmvst)
rouk.put("/like/:postid/:idk/:notid", cont.liking)
rouk.put("/rmvlike/:postid/:idk", cont.rmvlike)
rouk.put("/addcoment/:postid/:notid/:idk", cont.addcoment)
rouk.put("/rmvcomt/:postid/:indt", cont.rmvcomt)
rouk.post("/sendmsg/:recvr/:sender", cont.sendmsg)
rouk.get("/viewmsgs/:recvr/:sender", cont.fetchmsgs)
rouk.put("/token/:userid", cont.genratetokn)
rouk.get("/fetchusers", verifyToken , cont.getallusers)
rouk.get("/fetchallsubg", cont.fetchAllsubcatg)
rouk.get("/fetchreports", verifyToken, cont.getreports)
rouk.get("/fetchstats/:uname", cont.getStatus)
rouk.get("/fetchpostsbycatg/:catgk/:indt", cont.postsbycatg)
rouk.get("/viewnotifications/:idk", cont.viewnotifs)
rouk.put("/dropallnotificat/:idk", cont.dropallnotf)
rouk.put("/reanotfy/:notid", cont.readnotify)
rouk.delete("/deletepost/:delpostid", cont.deletepostbyid)
rouk.delete("/deleteuserbyAdm/:deluserid", cont.deleteuserbyadm)
rouk.put("/deletereadnotifcations/:idk", cont.delreadnof)
rouk.put("/rmvnotif/:idk/:notid", cont.rmvnotf)
rouk.get("/searchfront/:searchval/:indt", cont.searchft)
rouk.get("/fetchlatestpost", cont.fetchlatestposts)
rouk.get("/searchuser/:userqry", cont.searchusers)
rouk.post("/sendwarn", cont.send_warning)
rouk.delete("/deleteaccount", cont.deleteacount)

module.exports = rouk;