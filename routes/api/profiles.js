const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const isEmpty = require ('../../validation/is-empty.js');

mongoose.set('useFindAndModify', false);

/*const profiles = express();
const bodyParser = require('body-parser')
profiles.use(bodyParser.json())*/


//load validation
const validateProfileInput = require ('../../validation/profile');
const validateExperienceInput = require ('../../validation/experience');
const validateEducationInput = require ('../../validation/education');


//Load Profile model
const Profile = require('../../models/Profile');

//Load User model
const User = require('../../models/User');

// @route GET api/profiles/test
// @desc Profiles posts route
// @access Public

router.get('/test', (req, res) => {
    res.json({
        msg: "Profiles works",
        msg2:req.body
    });

});


// @route GET api/profiles
// @desc get current user profile
// @access private

router.get('/', passport.authenticate('jwt', {session: false},null), (req, res) => {
    console.log(req.body);
    const errors = {};
    Profile.findOne({user: req.user.id})
        .populate('user', ['name','avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                return res.status(404).json(errors)
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});


// @route post api/profiles/
// @desc create or edit a user profile
// @access private


router.post("/", passport.authenticate('jwt', {session: false}),(req, res) => {
    console.log(req.body);
    const { errors, isValid } = validateProfileInput(req.body);

    if (!isValid){

        console.log(errors);
          return (res.status(400).json(errors));
    }
   //Get fields
        //console.log(req.body);
        const profileFields = {};
        profileFields.user = req.user.id;
        if(req.body.handle) profileFields.handle = req.body.handle;
        if(req.body.company) profileFields.company = req.body.company;
        if(req.body.website) profileFields.website = req.body.website;
        if(req.body.location) profileFields.location = req.body.location;
        if(req.body.bio) profileFields.bio = req.body.bio;
        if(req.body.status) profileFields.status = req.body.status;
        if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;

        //skills  -split into array
        if(typeof req.body.skills !=='undefined') {
            profileFields.skills = req.body.skills.split(',');
        }

        //Social
        profileFields.social = {};
        if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
        if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
        if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
        if(req.body.instagram) profileFields.social.instagram = req.body.instagram;
        if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

        Profile.findOne({ user: req.user.id }).then(profile => {
                if(profile) {
                    //Update
                    Profile.findOneAndUpdate({ user: req.user.id },{ $set:profileFields },{ new:true })
                        .then(profile =>res.json(profile))
                } else {
             //create

             // check if handle exists
                    Profile.findOne({ handle: profileFields.handle }).then (profile =>{
                        if(profile) {
                            errors.handle = 'This handle already exists';
                            res.status(400).json(errors);
                        }
                            // Save profile
                            new Profile(profileFields).save().then(profile => res.json(profile))
                                .catch(errors =>{res.status(400).json(errors)});
                    })
                  }
            });
          }
);



// @route get api/profiles/handle/:handle
// @desc get profile by handle
// @access public

router.get('/handle/:handle',(req,res) =>{
    const errors = {};
    Profile.findOne({ handle:req.params.handle })
        .populate('user',['name','avatar'])
        .then(profile =>{
            if(!profile) {
                errors.noprofile = "There is no profile for this handle";
                res.status(400).json(errors);
            } else {
                res.status(200).json(profile)
            }
        })
        .catch(err => res.status(404).json(err));
});


// @route get api/profiles/user/:user_id
// @desc get profile by user id
// @access public

router.get('/user/:user_id',(req,res) => {
    const errors = {};
    console.log(`server req for user id ${req.params.user_id}`);


    Profile.findOne({user: req.params.user_id})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = "There is no profile for this user ID";
                res.status(400).json(errors);
            } else {
                res.status(200).json(profile)
            }
        })
        .catch(err => res.status(404).json({msg:"There is no profile for this user ID"}));
});



// @route get api/profiles/all
// @desc get all profiles
// @access public

router.get('/all',(req,res) =>{

    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if (!profiles){
                return res.status(404).json({msg:'There are no profiles'})
            }
            res.json(profiles);
        })
});


// @route post api/profiles/experience
// @desc add experience to profile
// @access private

router.post('/experience',passport.authenticate('jwt', {session: false}),(req,res) =>{
    const { errors, isValid } = validateExperienceInput(req.body);
console.log(req.body)
    if (!isValid){
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id})
        .then(profile =>{
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
            //add to experience array
            profile.experience.unshift(newExp);
            profile.save().then(profile =>res.json(profile))
            })
        });



// @route post api/profiles/education
// @desc add education to profile
// @access private

router.post('/education',passport.authenticate('jwt', {session: false}),(req,res) =>{
    const { errors, isValid } = validateEducationInput(req.body);

    console.log(req.body);

    if (!isValid){
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id})
        .then(profile =>{
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
            //add to experience array
            profile.education.unshift(newEdu);
            profile.save().then(profile =>res.json(profile))
        })
});





// @route delete api/profiles/experience/:exp_id
// @desc delete experience by id
// @access private

router.delete('/experience/:exp_id',passport.authenticate('jwt', {session: false}),(req,res) =>{

    console.log(req.params)


    Profile.findOne({ user: req.user.id})
        .then(profile =>{
        //Get remove index
            const removeIndex = profile.experience
                .map(item => item.id)
                .indexOf(req.params.exp_id);

            //Splice out of the array
            profile.experience.splice(removeIndex,1)

            //Save the array
            profile.save().then(profile => res.json(profile));
            })
        .catch(err => res.status(404).json(err))
});





/*
router.delete('/experience/:exp_id',passport.authenticate('jwt', {session: false}),(req,res) =>{
    //console.log(req.params, req.user.id)
    Profile.findOne({ user: req.user.id})
        .then(profile =>{
            //Get remove index
 console.log(profile.experience[0]._id, req.params.exp_id)

            if(profile.experience[0]._id === req.params.exp_id) {
                const removeIndex = profile.experience
                    .map(item => item.id)
                    .indexOf(req.params.exp_id);

                //Splice out of the array
                profile.experience.splice(removeIndex, 1)

                //Save the array
                profile.save().then(profile => res.json({msg:`successfully deleted exp id ${req.params.exp_id}`}));
            } else {
            return res.status(404).json({msg: "invalid experience id"})
            }
        })

});
*/

// @route delete api/profiles/education/:edu_id
// @desc delete experience by id
// @access private

router.delete('/education/:edu_id',passport.authenticate('jwt', {session: false}),(req,res) =>{

    console.log(req.params)


    Profile.findOne({ user: req.user.id})
        .then(profile =>{
            //Get remove index
            const removeIndex = profile.education
                .map(item => item.id)
                .indexOf(req.params.edu_id);

            //Splice out of the array
            profile.education.splice(removeIndex,1)

            //Save the array
            profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.status(404).json(err))
});


// @route delete api/profiles/
// @desc delete user and profile
// @access private

router.delete('/',passport.authenticate('jwt', {session: false}),(req,res) =>{
    Profile.findOneAndRemove({ user: req.user.id})
        .then(() =>{
           User.findOneAndRemove({_id: req.user.id})
               .then(()=>{
                   res.json({success:true})
               })

        })


});




module.exports = router;