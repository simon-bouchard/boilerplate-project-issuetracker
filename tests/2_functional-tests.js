const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Issue = require('../model/Issue')

chai.use(chaiHttp);

suite('Functional Tests', function() {

	let issue_id
	let issue_id2

	test('POST issue with every field', (done) => {

		const now = new Date().toISOString();
			
		chai
			.request(server)
			.keepOpen()
			.post('/api/issues/project')
			.send({
 				issue_title: 'Something',
				issue_text: 'something',
				created_by: 'someone',
				assigned_to: 'someone also',
				status_text: 'something'
			})
			.end((err, res) => {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.equal(res.body.project, 'project', 'Project name should match');
      				assert.equal(res.body.issue_title, 'Something', 'Title should match');
      				assert.equal(res.body.issue_text, 'something', 'Text should match');
      				assert.equal(res.body.created_by, 'someone', 'Created by should match');
      				assert.equal(res.body.assigned_to, 'someone also', 'Assigned to should match');
      				assert.equal(res.body.status_text, 'something', 'Status text should match');
      				assert.equal(res.body.open, true, 'Open status should be true');

					const createdTime = new Date(res.body.created_on).getTime();
			        const updatedTime = new Date(res.body.updated_on).getTime();
			        const nowTime = new Date(now).getTime();

					assert.closeTo(createdTime, nowTime, 5000, 'created_on should be close to the current time');
			      	assert.closeTo(updatedTime, nowTime, 5000, 'updated_on should be close to the current time');

				issue_id = res.body._id
				
				done()
			})	
	})

	test('POST issue with only required field', (done) => {

		const now = new Date().toISOString();
			
		chai
			.request(server)
			.keepOpen()
			.post('/api/issues/project')
			.send({
 				issue_title: 'Something',
				issue_text: 'something',
				created_by: 'someone',
			})
			.end((err, res) => {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.equal(res.body.project, 'project', 'Project name should match');
      				assert.equal(res.body.issue_title, 'Something', 'Title should match');
      				assert.equal(res.body.issue_text, 'something', 'Text should match');
      				assert.equal(res.body.created_by, 'someone', 'Created by should match');
      				assert.equal(res.body.assigned_to, '', 'Assigned to should match');
      				assert.equal(res.body.status_text, '', 'Status text should match');
      				assert.equal(res.body.open, true, 'Open status should be true');

					const createdTime = new Date(res.body.created_on).getTime();
			        const updatedTime = new Date(res.body.updated_on).getTime();
			        const nowTime = new Date(now).getTime();

					assert.closeTo(createdTime, nowTime, 5000, 'created_on should be close to the current time');
			      	assert.closeTo(updatedTime, nowTime, 5000, 'updated_on should be close to the current time');

				issue_id2 = res.body._id
				
				done()
			})	
	})

	test('POST issue with missing required field', (done) => {

		const now = new Date().toISOString();
			
		chai
			.request(server)
			.keepOpen()
			.post('/api/issues/project')
			.send({
				assigned_to: 'someone also',
				status_text: 'something'
			})
			.end((err, res) => {
				assert.equal(res.status, 400, 'Response status should be 400');
				
				done()
			})	
	});

	test('GET request to /api/issues/{project}', (done) => {

		chai
			.request(server)
			.keepOpen()
			.get('/api/issues/project')
			.end((err, res) => {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.isArray(res.body, 'Response should be an array');

				if (res.body.length > 0) {
					const issue = res.body[0];
				    assert.isObject(issue, 'Each issue should be an object');
				    assert.hasAllKeys(
				        issue,
						['_id', 'issue_title', 'issue_text', 'created_by', 'project', 'assigned_to', 'status_text', 'open', 'created_on', 'updated_on'],
						'Each issue should have the required keys'
					);
				}
				
				done()
			})	
	});

	test('GET request to /api/issues/{project} with one filter', (done) => {

		chai
			.request(server)
			.keepOpen()
			.get('/api/issues/project?open=true')
			.end((err, res) => {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.isArray(res.body, 'Response should be an array');

				res.body.forEach((issue, index) => {
				    assert.equal(issue.open, true, `Issue at ${index} should have "open: true"`);
				});
				
				done()
			})	
	});

	test('GET request to /api/issues/{project} with multiple filters', (done) => {

		chai
			.request(server)
			.keepOpen()
			.get('/api/issues/project?open=true&assigned_to=someone')
			.end((err, res) => {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.isArray(res.body, 'Response should be an array');

				res.body.forEach((issue, index) => {
				    assert.equal(issue.open, true, `Issue at ${index} should have "open: true"`);
				    assert.equal(issue.assigned_to, 'someone', `Issue at ${index} should have "assigned_to: someone"`);
				});
				
				done()
			})	
	});

	test('Update one field with PUT request', async () => {

		const now = new Date().toISOString();
			
		const res = await chai
			.request(server)
			.keepOpen()
			.put('/api/issues/project')
			.send({
				_id: issue_id,
				assigned_to: 'you'
			})
		assert.equal(res.status, 200, 'Response status should be 200');
		assert.equal(res.body.result, 'successfully updated', 'Result should be "successfully created"');
      	assert.equal(res.body._id, issue_id, '_id should match');

		const issue = await Issue.findOne({_id: issue_id})

    	assert.equal(issue.issue_title, 'Something', 'Title should match');
      	assert.equal(issue.issue_text, 'something', 'Text should match');
      	assert.equal(issue.created_by, 'someone', 'Created by should match');
      	assert.equal(issue.assigned_to, 'you', 'Assigned to should match');
      	assert.equal(issue.status_text, 'something', 'Status text should match');
      	assert.equal(issue.open, true, 'Open status should be true');

	    const updatedTime = new Date(issue.updated_on).getTime();
	    const nowTime = new Date(now).getTime();

	    assert.closeTo(updatedTime, nowTime, 5000, 'updated_on should be close to the current time');
				
	});

	test('Update multiple fields with PUT request', async () => {

		const now = new Date().toISOString();
			
		const res = await chai
			.request(server)
			.keepOpen()
			.put('/api/issues/project')
			.send({
				_id: issue_id2,
				assigned_to: 'me',
				status_text: 'Resolved',
				open: false

			})
		assert.equal(res.status, 200, 'Response status should be 200');
		assert.equal(res.body.result, 'successfully updated', 'Result should be "successfully created"');
      	assert.equal(res.body._id, issue_id2, 'Id should match');

		const issue = await Issue.findOne({_id: issue_id2})

      	assert.equal(issue.issue_title, 'Something', 'Title should match');
      	assert.equal(issue.issue_text, 'something', 'Text should match');
      	assert.equal(issue.created_by, 'someone', 'Created by should match');
      	assert.equal(issue.assigned_to, 'me', 'Assigned to should match');
      	assert.equal(issue.status_text, 'Resolved', 'Status text should match');
      	assert.equal(issue.open, false, 'Open status should be true');

	    const updatedTime = new Date(issue.updated_on).getTime();
	    const nowTime = new Date(now).getTime();

	    assert.closeTo(updatedTime, nowTime, 5000, 'updated_on should be close to the current time');
	});

	test('Update an issue with invalid _id with PUT request', (done) => {

		chai
			.request(server)
			.keepOpen()
			.put('/api/issues/project')
			.send({
				_id: '000000000000000000000000',
				assigned_to: 'me',
				status_text: 'Resolved',
				open: false

			})
			.end((err, res) => {
				assert.equal(res.status, 404, 'Response status should be 404');
				assert.deepEqual(res.body, {error: 'could not update', _id: '000000000000000000000000'});
      				
				done()
			})	
	});

	test('Delete an issue', (done) => {

		chai
			.request(server)
			.keepOpen()
			.delete('/api/issues/project')
			.send({
				_id: issue_id,
			})
			.end((err, res) => {
				assert.equal(res.status, 200, 'Response status should be 200');
      			assert.equal(res.body.result, 'successfully deleted', 'Response result should be different');
				assert.equal(res.body._id, issue_id, 'Response _id should be different');
				done()
			})	
	});

	test('Delete an issue with invalid id', (done) => {

		chai
			.request(server)
			.keepOpen()
			.delete('/api/issues/project')
			.send({
				_id: '000000000000000000000000',
			})
			.end((err, res) => {
				assert.equal(res.status, 404, 'Response status should be 404');
				done()
			})	
	});

	test('Delete an issue with missing id', (done) => {

		chai
			.request(server)
			.keepOpen()
			.delete('/api/issues/project')
			.send({
				_id: issue_id
			})
			.end((err, res) => {
				assert.equal(res.status, 404, 'Response status should be 404');
				done()
			})	
	});

});
