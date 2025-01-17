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
			return res.status(400).json({ error: 'required field(s) missing' });
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
    	let project = req.params.project;
		let _id = req.body._id;

		const update = req.body;
		delete update._id;

		try {
			const issue = await Issue.findOneAndUpdate(
				{_id: _id},
				update
			);
			if (!issue) {
				return res.status(404).json({error: 'could not update', _id: _id})
			}
		} catch (err) {
			return res.status(404).json({ error: 'could not update', _id: _id });
		};

		return res.status(200).json({result: 'successfully updated', _id: _id});
      
    })
    
    .delete(async (req, res) => {
    	let project = req.params.project;
		const _id = req.body._id;

		if (!_id) {
			return res.status(400)
		} else if (!mongoose.Types.ObjectId.isValid(_id)) {
			return res.status(400);
		}

		try {
			const issue = await Issue.findOneAndDelete({_id: _id});

			if (!issue) {
				return res.status(404).json({error: 'could not delete', _id: _id})
			}

			res.status(200).json({result: 'successfully deleted', _id: _id})

		} catch (err) {
			console.error(err);
			res.status(404).json({error: 'could not delete', _id: _id});
		}
      

    });
    
};
