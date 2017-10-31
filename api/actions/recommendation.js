/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const recommendations = require('../../recommendation.json').recommendations;

let recommend = (context) => {
    context.need_conversation = true;
    context.command = undefined;

    let reqOption = {
        method : 'GET',
        url : process.env.RBS_URL + '/freebusy/room',
        headers : {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
        },
        qs : {
        'roomid' : roomid,
        'start' : startTimestamp.valueOf(),
        'end' : endTimestamp.valueOf()
        }
    };
    

    return new Promise((resolved, rejected) => {
        request(reqOption, (err, res, body) => {
            if(!err){
                body = JSON.parse(body);
                console.log(body);
            }
        })

        context.recommend_result = recommendations[Math.floor(Math.random() * recommendations.length)];
        resolved(context);
    });
}

module.exports = {
    'recommend': recommend
};