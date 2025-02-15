'use strict';
const express = require('express')
const Issue = require('../model/Issue')
const mongoose = require('mongoose')

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async (req, res) => {
  		let project = req.params.project;

		let filters = req.query;

		try {

			const query = {project, ...filters};
		
			const issues = await Issue.find(query);

			return res.status(200).json(issues);
		} catch (err) {
			res.status(500).json({error: 'Server error'});
		}
      
    })
    
    .post(async (req, res) => {

		const { issue_title, issue_text, created_by } = req.body;

		if (!issue_title || !issue_text || !created_by) {
			return res.json({ error: 'required field(s) missing' });
		}

    	let project = req.params.project;
    	
		let issue = await Issue.create({
			project: project,
			issue_title: req.body.issue_title,
			issue_text: req.body.issue_text,
			created_by: req.body.created_by,
			assigned_to: req.body.assigned_to,
			status_text: req.body.status_text,
		});

		return res.json(issue)

    })
    
    .put(async (req, res) => {
    	const project = req.params.project;
    	const _id = req.body._id;

		if (!_id) {
        	return res.json({ error: 'missing _id' });
    	}

		if (!mongoose.Types.ObjectId.isValid(_id)) {
        	return res.json({ error: 'could not update' });
    	}

		if (!req.body.issue_title && !req.body.issue_text && !req.body.created_by && !req.body.assigned_to && !req.body.status_text) {
			return res.json({error: 'no update field(s) sent', _id: _id})
		}

    	    	const update = req.body;
    	delete update._id; // Prevent updates to the immutable _id field

    	try {

        	const issue = await Issue.findOneAndUpdate(
            	{ _id },
            	{ ...update, updated_on: new Date() }, // Update fields and set updated_on
            	{ new: true } // Return updated document and validate updates
        	);

        	if (!issue) {
            	return res.json({ error: 'could not update', _id });
        	}

        	return res.json({ result: 'successfully updated', _id });
    	} catch (err) {
        	return res.status(500).json({ error: 'server error', details: err.message });
    	}
	})

    
    .delete(async (req, res) => {
    	let project = req.params.project;
		const _id = req.body._id;

		if (!_id) {
			return res.json({error: 'missing _id'})
		} else if (!mongoose.Types.ObjectId.isValid(_id)) {
			return res.json({error: 'could not delete', _id: _id});
		}

		try {
			const issue = await Issue.findOneAndDelete({_id: _id});

			if (!issue) {
				return res.json({error: 'could not delete', _id: _id})
			}

			res.status(200).json({result: 'successfully deleted', _id: _id})

		} catch (err) {
			res.json({error: 'could not delete', _id: _id});
		}
      

    });
    
};
