var Consumer = require('sqs-consumer');
var AWS = require('aws-sdk');
var sqs = new AWS.SQS();

var app = Consumer.create({
  queueUrl: 'consumer-queue-arn',
  region: 'us-east-1',
  batchSize: 5,
  handleMessage: function (message, done) {

    var msgBody = JSON.parse(message.Body);

	var sqsParams = {
	  MessageBody: JSON.stringify(msgBody),
	  QueueUrl: 'receiver-queue-arn'
	};

	sqs.sendMessage(sqsParams, function(err, data) {
	  if (err) {
	    console.log('ERR', err);
	  }
	  console.log(data);
	});

    return done();

  }
});


app.on('error', function (err) {
  console.log(err);
});

app.start();