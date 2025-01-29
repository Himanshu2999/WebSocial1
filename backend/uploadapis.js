const mg = require('mongoose')
const modk = require('./models')
const exp = require('express')
let updk = exp.Router()
const mlt = require('multer')
const fs = require('fs')

let profstorage = mlt.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/userprofies")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)
    }
})

/*
let posttorage = mlt.diskStorage({
    destination: function(req, file, cb){
        if(Mime.getType(req.file.filename).startsWith('image')){
            cb(null, "public/uploads/posts/images")
        }else if(Mime.getType(req.file.filename).startsWith('video')){
            cb(null, "public/uploads/posts/videos")
        }
    },
    filename: (req, file, cb)=>{
        cb(null, Date.now() + file.originalname)
    }
})
*/
let catgstorg = mlt.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/catgs")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

let subcatgstorg = mlt.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/subcatgs")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

let postfilestorg = mlt.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/posts")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

let statstorg = mlt.diskStorage({
    destination: function(req, file, cb){
        cb(null, "public/uploads/status")
    },
    filename:function(req, file, cb){
        cb(null, Date.now() + file.originalname)
    }
})

let reptstorg = mlt.diskStorage({
    destination: function(req, file, cb){
        cb(null, "public/uploads/reportmedia")
    },
    filename:function(req, file, cb){
        cb(null, Date.now() + file.originalname)
    }
})

// let postupd = mlt({storage: posttorage})


/*let postupgh = mlt({
    storage: postfilest,
    fileFilter: async function (req, file, cb) {
        let type = await fromBuffer(file.buffer);
        if (type && (type.mime.startsWith('image') || type.mime.startsWith('video'))) {
            cb(null, true);
        } else {
            cb(new Error("Unsupported file type"), false);
        }
    }
});*/


let uploads = {
    catg: mlt({ storage: catgstorg }),
    subcatg: mlt({ storage: subcatgstorg }),
    profiley: mlt({ storage: profstorage }),
    postfiles : mlt({storage: postfilestorg}),
    filestatus: mlt({storage: statstorg }),
    reportfiles: mlt({storage: reptstorg})
}



updk.put("/otherdet/:uname", uploads.profiley.single("profile"), async (req, res) => {
    let proname;
    if(!req.file){
        proname = "noimg.jpg";
    }else{
        proname = req.file.filename;
    }
    let data = await modk.UserModel.updateOne({ UserName: req.params.uname }, { $set: { RecoveryEmail: req.body.rmail, Profile: proname, DOB: req.body.dob } })
    if (data.modifiedCount === 1) {
        res.status(200).json({ statuscode: 1, msg: "Detailes addedd successfuly" })
    } else {
        res.status(500).json({ statuscode: 0, msg: "404 error occur" })
    }
})

updk.put("/editprofile", uploads.profiley.single("userprof"), async (req, res) => {
    let proname;
    if (!req.file) {
        proname = req.body.oldprof;
    } else if (req.body.oldprof !== "noimg.jpg") {
        fs.unlinkSync(`public/uploads/userprofies/${req.body.oldprof}`)
    }
    let data = await modk.UserModel.updateOne({ _id: req.body.idk }, { $set: { UserName: req.body.uname, bio: req.body.bio, Profile: proname } })
    if (data.modifiedCount === 1) {
        res.status(200).json({ statuscode: 1 })
    } else {
        res.status(500).json({ statuscode: 0 })
    }
})

let picname;
updk.post("/addcatg", uploads.catg.single("thumb"), async (req, res) => {
    if (!req.file) {
        picname = "noimg.jpg"
    } else {
        picname = req.file.filename;
    }
    let catk = new modk.CatgModel({ Title: req.body.titl, Thumbnail: picname })
    let sav = await catk.save()
    if (sav) {
        res.status(200).json({ statuscode: 1 })
    } else {
        res.status(500).json({ statuscode: 0 })
    }
})

updk.post("/addsubcatg", uploads.subcatg.single("thumb"), async (req, res) => {
    if (!req.file) {
        picname = "noimg.jpg"
    } else {
        picname = req.file.filename;
    }
    let sbcatk = new modk.SubCatModel({ Title: req.body.titl, Thumbnail: picname, Category: req.body.catid })
    let sav = await sbcatk.save()
    if (sav) {
        res.status(200).json({ statuscode: 1 })
    } else {
        res.status(500).json({ statuscode: 0 })
    }
})

updk.put("/updpubinfo/:idk", uploads.profiley.single('prof'), async(req, res)=>{
    // try{
        if(!req.file){
            picname = req.body.profile;
        }else if(req.body.profile!=="noimg.jpg"){
            picname = req.file.filename;
            fs.unlinkSync(`public/uploads/userprofies/${req.body.profile}`)
        }else{
            picname = req.file.filename;
        }
        let dt = await modk.UserModel.updateOne({_id: req.params.idk}, {$set: {UserName: req.body.name, Profile: picname, 
            bio: req.body.biok,
         }})
        if(dt.modifiedCount===1){
            res.status(200).json({statuscode: 1})
        }else{
            res.status(500).json({statuscode: 0})
        }
    }
/*    catch(e){
        res.status(900).json({statuscode: -1})
    } */
)

updk.post("/addpost", uploads.postfiles.array('files', 4), async(req,res)=>{
    try{
        let fileNames = req.files.map(file => file.filename);
        let data = new modk.PostModel({Content: fileNames, Text: req.body.text, Categories: req.body.scat, Addedby: req.body.idk, View: req.body.view})
        let sav = await data.save()
        if(sav){
            res.status(200).json({statuscode: 1})
        }else{
            res.status(500).json({statuscode: 0})
        }
    }
    catch(e){
        res.status(900).json({statuscode: -1})
    }
})

updk.put("/filesta/:idk", uploads.filestatus.single("file"), async(req,res)=>{
    try{
        let dt = await modk.UserModel.updateOne({_id: req.params.idk}, {$push: {Status: req.file.filename}})
        if(dt.modifiedCount===1){
            res.status(200).json({statuscode: 1})
        }else{
            res.status(500).json({statuscode: 0})
        }
    }
    catch(e){
        res.status(900).json({statuscode: -1})
    }
})

updk.post("/report", uploads.reportfiles.array('medias', 4), async(req,res)=>{
    try{
        let filenames = req.files.map(file=>file.filename)
        let rept = new modk.ReportModel({Reported_id: req.body.rid, Issue: req.body.issue, Details: req.body.details, Media: filenames, Reportedby: req.body.idk, ReportedOn: new Date() })
        let sv = await rept.save()
        if(sv){
            res.status(200).json({statuscode: 1})
        }else{
            res.status(500).json({statuscode: 0})
        }
    }
    catch(e){
        res.status(900).json({statuscode: -1})
    }
})

module.exports = updk;


