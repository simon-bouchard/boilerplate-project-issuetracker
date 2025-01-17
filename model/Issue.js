const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
	  project: { type: String, required: true },
	  issue_title: { type: String, required: true },
	  issue_text: { type: String, required: true },
	  created_by: { type: String, required: true },
	  assigned_to: { type: String, default: '' },
	  status_text: { type: String, default: '' },
	  open: { type: Boolean, default: true },
	  created_on: { type: Date, default: Date.now },
	  updated_on: { type: Date, default: Date.now },
});

issueSchema.set('toJSON', {
	transform: (doc, ret) => {
		delete ret.__v;
		return ret;
	},
});

module.exports = mongoose.model('Issue', issueSchema);

