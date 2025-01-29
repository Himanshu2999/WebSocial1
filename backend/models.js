const { type } = require('@testing-library/user-event/dist/type')
const mg = require('mongoose')

let userschema = new mg.Schema({UserName:{type: String, required: true, unique: true}, Email: {type: String, required: true}, Password: {type: String, required: true}, 
    DOB: {type: String}, bio: {type: String, maxlength: 180}, Status: {type: [Object], maxlength: 4},
    RecoveryEmail: {type: String}, Profile: {type: String}, Followers: [Object], Following: [Object], Blocks: [Object],
    Notifications: [Object], CreatedOn: {type: String}, usertype : {type: String},recovtoken: {type: String}
}, {versionKey: false})

let catgschema = new mg.Schema({Title: {type: String}, Thumbnail: {type: String}}, {versionKey: false})
let subcatgschema = new mg.Schema({Title: {type: String}, Thumbnail: {type: String},Category: {type: String}}, {versionKey: false})
let postschema = new mg.Schema({ Content: {type: [Object]}, Text: {type: String}, Categories: {type: [Object]}, Likes: [Object], Comments: [Object], View: {type: String}, Addedby: {type: String}}, {versionKey: false})
let msgchema = new mg.Schema({Sender: {type: String}, Receiver : {type: String}, Message: {type: String}, Date:{type: String}, Time: {type: String}}, {versionKey: false})

let reportschema =new mg.Schema({Reported_id: {type: String}, Issue: {type: String}, Details: {type: String}, Media: [Object], Reportedby: {type: String}, ReportedOn: 
{type: String}  }, {versionKey: false})

let sitemodel = {
    UserModel: mg.model('users', userschema),
    CatgModel: mg.model('categories', catgschema),
    SubCatModel: mg.model('subcategories', subcatgschema),
    PostModel: mg.model('posts', postschema),
    MsgModel: mg.model('messages', msgchema),
    ReportModel: mg.model('reports', reportschema),
}

module.exports = sitemodel;