const mg = require('mongoose')
const modk = require('./models');
const sendMail = require('./mailmen');
const cryp = require('crypto');
const uuid = require('uuid')
const jwt = require('jsonwebtoken');
const { send } = require('process');

let veri = 5;

exports.send_email = async (req, res) => {
    veri = cryp.randomInt(1000, 9000);
    setTimeout(() => {
        veri = null;
    }, 20 * 60 * 1000)
    let mil = await sendMail(req.body.email, "Verify your Account", `Your OTP is: ${veri}`, "app")
    if (mil) {
        res.status(200).json({ statuscode: 1 })
    } else {
        res.status(500).json({ statuscode: 0 })
    }
}


exports.searchft = async (req, res) => {
    try {
        let postqry = await modk.PostModel.find({ Text: { $regex: '.*' + req.params.searchval, $options: 'i' } },
            { Content: { $slice: 2 } }).skip(parseInt(req.params.indt)).limit(2)
        if (postqry !== null) {
            res.status(200).json({ statuscode: 1, posts: postqry })
        } else {
            res.status(404).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.send_warning = async (req, res) => {
    let newDate = new Date();
    let sendid = await modk.UserModel.findOne({ UserName: req.body.uname }).select("UserName")
    let recvid = await modk.PostModel.findOne({ _id: req.body.actid }).select("Addedby")
    let warnsend = new modk.MsgModel({ Sender: sendid._id, Receiver: recvid.Addedby, Message: req.body.msg, Date: newDate, Time: `${newDate.getHours()}:${newDate.getMinutes()}` })
    let msgsv = await warnsend.save();
    if (msgsv) {
        res.status(200).json({ statuscode: 1 })
    } else {
        res.status(500).json({ statuscode: 0 })
    }
}

exports.viewnotifs = async (req, res) => {
    try {
        let notfs = await modk.UserModel.findOne({ _id: req.params.idk }).select("Notifications")
        if (notfs !== null) {
            res.status(200).json({ statuscode: 1, notf: notfs })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.dropallnotf = async (req, res) => {
    let notfs = await modk.UserModel.updateOne({ _id: req.params.idk, Password: req.body.pass }, { $set: { Notifications: [] } })
    if (notfs.modifiedCount === 1) {
        res.status(200).json({ statuscode: 1 })
    } else {
        res.status(404).json({ statuscode: 0 })
    }
}

/* catch (e) {
     res.status(900).json({ statuscode: -1, errorcode: e.code })
 } */

exports.accountsubmit = async (req, res) => {
    try {
        if (veri !== null) {
            let usertok = req.body.tok;
            if (usertok == veri) {
                let data = new modk.UserModel({ UserName: req.body.name, Email: req.body.email, Password: req.body.pas, RecoveryEmail: "", Age: 0, Profile: "", CreatedOn: new Date() })
                let save = await data.save();
                if (save) {
                    res.status(200).json({ statuscode: 1 })
                } else {
                    res.status(500).json({ statuscode: 0 })
                }
            } else {
                res.status(404).json({ statuscode: 2, msg: "Incorrect OTP" })
            }
        }
        else {
            res.status(303).json({ statuscode: -3, msg: "OTP expired" })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1, errocode: e.code })
    }
}


exports.log = async (req, res) => {
    let data = await modk.UserModel.findOne({ $and: [{ $or: [{ UserName: req.body.uname }, { Email: req.body.email }] }, { Password: req.body.pass }] })
    if (data !== null) {
        if(data.usertype==="admin"){
            let token = jwt.sign({data: data._id}, process.env.TOKEN_JSON, {expiresIn: '1h'})
            res.status(200).json({statuscode: 1, udata: data, jtoken: token})
        }
        res.status(200).json({ statuscode: 1, udata: data })
    }
    else {
        res.status(500).json({ statuscode: 0, msg: "Incorrect credentials" })
    }
}



exports.forgmail = async (req, res) => {
    try {
        let retok = uuid.v4();
        let mil = await sendMail(req.body.rmail, "Reset Password Link", `Click on this link:- http://localhost:3000/forg?tok=${retok}, This link will expire after 20minutes`,
            "app")
        let toknupd = await modk.UserModel.updateOne({ RecoveryEmail: req.body.rmail }, { $set: { recovtoken: retok } })

        if (mil && toknupd) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.reforg = async (req, res) => {
    try {
        let tokndestroy = await modk.UserModel.updateOne({ recovtoken: req.params.tok }, { $set: { recovtoken: "" } })
        if (tokndestroy.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.changforg = async (req, res) => {
    try {
        let upd = await modk.UserModel.updateOne({ recovtoken: req.params.tok }, { $set: { Password: req.body.pass } })
        if (upd.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.profData = async (req, res) => {
    try {
        let dat = await modk.UserModel.findOne({ UserName: req.params.uname })
        if (dat !== null) {
            res.status(200).json({ statuscode: 1, udat: dat })
        }
        else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.follow = async (req, res) => {
    try {
        let followingdata = { Username: req.body.followinguname, Profile: req.body.followingprofile }
        let followerdata = { Username: req.body.followeruname, Profile: req.body.followerprofile }
        let follower = await modk.UserModel.updateOne({ _id: req.body.followingID }, { $push: { Followers: followerdata } })
        let following = await modk.UserModel.updateOne({ _id: req.body.followerID }, { $push: { Following: followingdata } })
        if (follower.modifiedCount === 1 && following.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.unfollow = async (req, res) => {
    try {
        let followingdata = { Username: req.body.followinguname, Profile: req.body.followingprofile }
        let followerdata = { Username: req.body.followeruname, Profile: req.body.followerprofile }
        let follower = await modk.UserModel.updateOne({ _id: req.body.followingID }, { $pull: { Followers: followerdata } })
        let following = await modk.UserModel.updateOne({ _id: req.body.followerID }, { $pull: { Following: followingdata } })
        if (follower.modifiedCount === 1 && following.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}


exports.fetchcatg = async (req, res) => {
    try {
        let cats = await modk.CatgModel.find().select('Title')
        if (cats !== null) {
            res.status(200).json({ statuscode: 1, catgs: cats })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.fetchsubpcat = async (req, res) => {
    try {
        if (req.params.cat !== '') {
            let scatgs = await modk.SubCatModel.find({ Category: req.params.cat }).select('Title')
            if (scatgs !== null) {
                res.status(200).json({ statuscode: 1, scatgs: scatgs })
            } else {
                res.status(500).json({ statuscode: 0 })
            }
        } else {
            res.status(202).json({ statuscode: 2 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.fetchAllsubcatg = async (req, res) => {
    try {
        if (req.params.cat !== '') {
            let scatgs = await modk.SubCatModel.find().select('Title')
            if (scatgs !== null) {
                res.status(200).json({ statuscode: 1, scatgs: scatgs })
            } else {
                res.status(500).json({ statuscode: 0 })
            }
        } else {
            res.status(202).json({ statuscode: 2 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}


exports.fetchposts = async (req, res) => {
    try {
        let posts = await modk.PostModel.find();
        if (posts.length > 0) {
            res.status(200).json({ statuscode: 1, postgs: posts });
        } else {
            res.status(500).json({ statuscode: 0 });
        }
    } catch (e) {
        res.status(500).json({ statuscode: -1, error: e.message });
    }
};

exports.fetchlatestposts = async (req, res) => {
    try {
        let posts = await modk.PostModel.find();
        if (posts.length > 0) {
            res.status(200).json({ statuscode: 1, postgs: posts });
        } else {
            res.status(500).json({ statuscode: 0 });
        }
    } catch (e) {
        res.status(500).json({ statuscode: -1, error: e.message });
    }
};


exports.postsbycatg = async (req, res) => {
    try {
        let catid = await modk.SubCatModel.findOne({ Title: req.params.catgk })
        let posts = await modk.PostModel.find({ Categories: { $elemMatch: { $eq: catid._id.toString() } } }, { Content: { $slice: 2 } }).skip(parseInt(req.params.indt)).limit(2)
        if (posts.length > 0) {
            res.status(200).json({ statuscode: 1, postcatgs: posts })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

/*
exports.postsbycatg = async (req, res) => {
try {
  // Find the category ID based on the provided title
  let catid = await modk.SubCatModel.findOne({ Title: req.params.catgk });
 
  // Assuming catid._id exists
  let posts = await modk.PostModel.find(
    { Categories: { $in: [catid._id] } }, // Use $in operator to match category ID
    { Content: { $slice: 2 } } // Project Content to limit it to 2 items
  )
  .skip(parseInt(req.params.indt, 10)) // Parse and skip the specified number of documents
  .limit(2); // Limit the result to 2 documents
 
  // Check if posts are found and respond accordingly
  if (posts.length > 0) {
    res.status(200).json({ statuscode: 1, postcatgs: posts });
  } else {
    res.status(404).json({ statuscode: 0, message: 'No posts found' });
  }
} catch (e) {
  // Handle any server errors
  res.status(500).json({ statuscode: -1, message: 'Server error', error: e.message });
}
};
*/

exports.postbyid = async (req, res) => {
    try {
        let post = await modk.PostModel.findOne({ _id: req.params.idbt })

        let addname = await modk.UserModel.findOne({ _id: post.Addedby }).select('UserName Profile')
        if (post !== null && addname !== null) {
            res.status(200).json({ statuscode: 1, postData: post, postert: addname })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }

}

exports.userposts = async (req, res) => {
    try {
        let user = await modk.UserModel.findOne({ UserName: req.params.userid }).select('UserName')
        let post = await modk.PostModel.find({ Addedby: user._id }, { Content: { $slice: 2 } })
        if (post !== null) {
            res.status(200).json({ statuscode: 1, posts: post })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.deletepostbyid = async (req, res) => {
    try {
        let userid = await modk.UserModel.findOne({ UserName: req.body.uname, Password: req.body.pass })
        let userverify = await modk.PostModel.findOne({ Addedby: userid._id })
        let adminverify = await modk.UserModel.findOne({ UserName: req.body.uname, Password: req.body.pass })
        if (adminverify !== null && adminverify.UserName !== undefined) {
            let postdlt = await modk.PostModel.deleteOne({ _id: req.params.delpostid })
            let rmvreport = await modk.ReportModel.deleteOne({ Reported_id: req.params.delpostid })
            if (postdlt.deletedCount === 1 && rmvreport.deletedCount === 1) {
                res.status(200).json({ statuscode: 1 })
            } else {
                res.status(500).json({ statuscode: 0 })
            }
        } else if (userverify !== null && userverify !== undefined) {
            let postdlt = await modk.PostModel.deleteOne({ _id: req.params.delpostid })
            let rmvreport = await modk.ReportModel.deleteOne({ Reported_id: req.params.delpostid })
            if (postdlt.deletedCount === 1) {
                res.status(200).json({ statuscode: 1 })
            } else {
                res.status(500).json({ statuscode: 0 })
            }
        } else {
            res.status(405).json({ statuscode: -3 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.getallusers = async (req, res) => {
    try {
        let users = await modk.UserModel.find()
        if (users !== null) {
            res.status(200).json({ statuscode: 1, users: users })
        } else {
            res.status(404).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.searchusers = async (req, res) => {
    try {
        let users = await modk.UserModel.find({
            $or: [{ UserName: { $regex: '.*' + req.params.userqry, $options: 'i' } },
            { bio: { $regex: '.*' + req.params.userqry, $options: 'i' } }]
        })
        if (users !== null) {
            res.status(200).json({ statuscode: 1, users: users })
        } else {
            res.status(404).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.deleteacount = async (req, res) => {
    try {
        let del = await modk.UserModel.deleteOne({ _id: req.body.idk, UserName: req.body.uname, Password: req.body.pass })
        if (del.deletedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    } 
catch (e) {
        res.status(900).json({ statuscode: -1 })
    }

}


exports.deleteuserbyadm = async (req, res) => {
    try {
        let adminverify = await modk.UserModel.findOne({ UserName: req.body.uname, Password: req.body.pass })
        if (adminverify !== null && adminverify.UserName !== undefined) {
            let delusrdata = await modk.UserModel.findOne({ _id: req.params.deluserid })
            let tell_mail = await sendMail(delusrdata.Email, "User account Deleted", `${delusrdata.UserName} ${req.body.reason}`, "app")
            let usrdlt = await modk.UserModel.deleteOne({ _id: req.params.deluserid })
            if (tell_mail && usrdlt.deletedCount === 1) {
                res.status(200).json({ statuscode: 1 })
            } else {
                res.status(500).json({ statuscode: 0 })
            }
        } else {
            res.status(404).json({ statuscode: -3, msg: "not admin! unathuorized" })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.edittext = async (req, res) => {
    try {
        let dt = await modk.PostModel.updateOne({ _id: req.params.idbt }, { $set: { Text: req.body.chgtext, View: req.body.chgview } })
        if (dt.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 });
    }
}

exports.changpass = async (req, res) => {
    try {
        let dt = await modk.UserModel.updateOne({ _id: req.body.idk, Password: req.body.oldpass }, { $set: { Password: req.body.newpass } })
        if (dt.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.restartuser = async (req, res) => {
    try {
        let data = await modk.UserModel.findOne({ _id: req.params.idk })
        if (data !== null) {
            res.status(200).json({ statuscode: 1, udata: data })
        } else {
            res.status(400).json({ statuscode: 0 })
        }
    }
    catch (e) {
        console.error(`Server error: ${e.message}, Code: ${e.code}`);
        res.status(404).json({ statuscode: -1, errorcode: e.code })
    }
}

exports.textstatus = async (req, res) => {
    try {
        let totstat = await modk.UserModel.find({ _id: req.params.idk }).select('Status')
        if (totstat.length === 4) {
            res.status(340).json({ statuscode: 2 })
        }
        else {
            let status = await modk.UserModel.updateOne({ _id: req.params.idk }, { $push: { Status: req.body.textstatus } })
            if (status.modifiedCount === 1) {
                res.status(200).json({ statuscode: 1 })
            } else {
                res.status(500).json({ statuscode: 0 })
            }
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.rmvst = async (req, res) => {
    try {
        let st = await modk.UserModel.updateOne({ _id: req.params.idk }, { $pop: { Status: -1 } })
        if (st.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}


exports.liking = async (req, res) => {
    try {
        let likinguser = await modk.UserModel.findOne({ _id: req.params.idk })
        let notification = { _id: uuid.v4() + Date.now().toString(), body: `${likinguser.UserName} liked your post`, status: "unread", Date: new Date() }
        let st = await modk.PostModel.updateOne({ _id: req.params.postid }, { $push: { Likes: req.params.idk } })
        let ut = await modk.UserModel.updateOne({ _id: req.params.notid }, { $push: { Notifications: notification } })
        if (st.modifiedCount === 1 && ut.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.rmvlike = async (req, res) => {
    try {
        let st = await modk.PostModel.updateOne({ _id: req.params.postid }, { $pull: { Likes: req.params.idk } })
        if (st.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.addcoment = async (req, res) => {
    try {
        const comtid = { ...req.body.comtinfo, _id: uuid.v4() + Date.now().toString() }
        let comuser = await modk.UserModel.findOne({ _id: req.params.idk })
        let notify = { _id: uuid.v4() + Date.now().toString(), body: `${comuser.UserName} added comment in your post`, status: "unread", Date: new Date() }
        let st = await modk.PostModel.updateOne({ _id: req.params.postid }, { $push: { Comments: comtid } })
        let ut = await modk.UserModel.updateOne({ _id: req.params.notid }, { $push: { Notifications: notify } })
        if (st.modifiedCount === 1 && ut.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.rmvcomt = async (req, res) => {
    try {
        let comrmv = await modk.PostModel.updateOne({ _id: req.params.postid },
            { $pull: { Comments: { _id: req.params.indt } } }
        )
        if (comrmv.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.readnotify = async (req, res) => {
    try {
        let updnotfy = await modk.UserModel.updateOne({ 'Notifications._id': req.params.notid }, { $set: { 'Notifications.$.status': "read" } })
        if (updnotfy.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(404).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }

}


exports.delreadnof = async (req, res) => {
    try {
        let delread = await modk.UserModel.updateOne({ _id: req.params.idk }, { $pull: { Notifications: { status: "read" } } });
        if (delread.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.rmvnotf = async (req, res) => {
    try {
        let delnofy = await modk.UserModel.updateOne({ _id: req.params.idk }, { $pull: { Notifications: { _id: req.params.notid } } });
        if (delnofy.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}



exports.sendmsg = async (req, res) => {
    try {
        let newDate = new Date();
        let recvr = await modk.UserModel.findOne({ UserName: req.params.recvr }).select('UserName')
        let msg = new modk.MsgModel({ Sender: req.params.sender, Receiver: recvr._id, Message: req.body.msg, Date: newDate, Time: `${newDate.getHours()}:${newDate.getMinutes()}` })
        let msgsav = await msg.save();
        let notifcaton = { _id: uuid.v4() + Date.now(), body: `${req.body.sendername} sends you a message` }
        let rcvnotify = await modk.UserModel.updateOne({ _id: recvr._id }, { $push: { Notifications: notifcaton } })
        if (msgsav && rcvnotify.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(404).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.genratetokn = async (req, res) => {
    try {
        let tokn = uuid.v4() + Date.now()
        let savtokn = await modk.UserModel.updateOne({ _id: req.params.userid }, { $set: { recovtoken: tokn } })
        if (savtokn.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1, token: tokn })
        } else {
            res.status(404).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.fetchmsgs = async (req, res) => {
    try {
        let recv = await modk.UserModel.findOne({ UserName: req.params.recvr }).select('Username')
        let msgs = await modk.MsgModel.find({ $or: [{ Receiver: recv._id, Sender: req.params.sender }, { Receiver: req.params.sender, Sender: recv._id }] })
        if (msgs !== null) {
            res.status(200).json({ statuscode: 1, msgdata: msgs })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.blockuser = async (req, res) => {
    try {
        let blocking = await modk.UserModel.updateOne({ _id: req.params.idk }, { $push: { Blocks: req.params.blockid } })
        if (blocking.modifiedCount === 1) {
            res.status(200).json({ statuscode: 1 })
        } else {
            res.status(500).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(200).json({ statuscode: -1 })
    }
}

exports.getreports = async (req, res) => {
    try {
        let repots = await modk.ReportModel.find()
        if (repots !== null) {
            res.status(200).json({ statuscode: 1, reports: repots })
        } else {
            res.status(404).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.fetchcomnts = async (req, res) => {
    try {
        let comnts = await modk.PostModel.findOne({ _id: req.params.postid }).select('Comments')
        if (comnts !== null) {
            res.status(200).json({ statuscode: 1, comments: comnts })
        } else {
            res.status(404).json({ statuscode: 0 })
        }
    }
    catch (e) {
        res.status(900).json({ statuscode: -1 })
    }
}

exports.getStatus = async (req, res) => {
    let statuses = await modk.UserModel.findOne({ UserName: req.params.uname }).select('Status')
    if (statuses !== null) {
        res.status(200).json({ statuscode: 1, stat: statuses })
    } else {
        res.status(404).json({ statuscode: 0 })
    }
}