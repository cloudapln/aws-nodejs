var async = require('async');
var AWS = require('aws-sdk');

var svc = new AWS.DynamoDB();

var scanComplete = false,
    itemCountTotal = 0,
    consumedCapacityUnitsTotal = 0;

var scanParams = {
	TableName: 'ddb-dev-archive',
    Select: 'COUNT'
};

// scan is called iteratively until all rows have been scanned
//  this uses the asyc module to wait for each call to complete
//  before issuing the next.
async.until( function() { return scanComplete; },
             function (callback) {
                svc.scan(scanParams, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(result);
                        if (typeof (result.LastEvaluatedKey) === 'undefined' ) {
                            scanComplete = true;
                        } else {
                            // set the start key for the next scan to our last key
                            scanParams.ExclusiveStartKey = result.LastEvaluatedKey;
                        }
                        itemCountTotal += result.Count;
                        consumedCapacityUnitsTotal += result.ConsumedCapacityUnits;
                        if (!scanComplete) {
                            console.log("cumulative itemCount " + itemCountTotal);
                            console.log("cumulative capacity units " + consumedCapacityUnitsTotal);
                        }
                    }
                    callback(err);
                });
             },
             // this runs when the loop is complete or returns an error
             function (err) {
                if (err) {
                    console.log('error in processing scan ');
                    console.log(err);
                } else {
                    console.log('scan complete')
                    console.log('Total items: ' + itemCountTotal);
                    console.log('Total capacity units consumed: ' + consumedCapacityUnitsTotal);
                }
             }
);