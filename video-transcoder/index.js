"use strict";

/**
 * Created by Hop Le
 * Last Updated: 15/10/2019
 *
 * Required Env Vars:
 * ELASTIC_TRANSCODER_REGION
 * ELASTIC_TRANSCODER_PIPELINE_ID
 */

const AWS = require("aws-sdk");

const elasticTranscoder = new AWS.ElasticTranscoder({
  region: process.env.ELASTIC_TRANSCODER_REGION
});

exports.handler = async function(event, context, callback) {
  console.log("Welcome!");
  console.log(`Region: ${process.env.ELASTIC_TRANSCODER_REGION}`);
  console.log(`Event ${JSON.stringify(event)}`);

  const pipelineId = process.env.ELASTIC_TRANSCODER_PIPELINE_ID;

  console.log(`Pipeline ID: ${pipelineId}`);

  const key = event.Records[0].s3.object.key;

  const sourceKey = decodeURIComponent(key.replace(/\+/g, " "));

  const outputKey = sourceKey.split(".")[0];

  const params = {
    PipelineId: pipelineId,
    OutputKeyPrefix: outputKey + "/",
    Input: {
      Key: sourceKey
    },
    Outputs: [
      {
        Key: outputKey + "-1080p" + ".mp4",
        PresetId: "1351620000001-000001" //Generic 1080p
      },
      {
        Key: outputKey + "-720p" + ".mp4",
        PresetId: "1351620000001-000010" //Generic 720p
      },
      {
        Key: outputKey + "-web-720p" + ".mp4",
        PresetId: "1351620000001-100070" //Web Friendly 720p
      }
    ]
  };

  // Call our function that creates an ElasticTranscoder Job
  return elasticTranscoder
    .createJob(params)
    .promise()
    .then(data => {
      // Success
      console.log(`ElasticTranscoder callback data: ${JSON.stringify(data)}`);
      callback(null, data);
    })
    .catch(error => {
      // Failure
      console.log(`An error occured ${JSON.stringify(error, null, 2)}`);
      callback(error);
    });
};

module.exports = {
  handler
};
