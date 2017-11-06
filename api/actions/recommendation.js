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

const request = require('request');
const calendar = require('./calendar.js');
const moment = require('moment');

let recommend = (context) => {
    context.need_conversation = true;
    context.command = undefined;

    var recommendations = Object.assign({}, require('../../recommendation.json').recommendations);

    let reqOption = {
        method : 'GET',
        url : process.env.TWC_URL + '/api/weather/v1/geocode/37/127/forecast/daily/3day.json',
        headers : {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    

    return new Promise((resolved, rejected) => {
        // get weather data
        request(reqOption, (err, res, body) => {
            if(!err){
                body = JSON.parse(body);

                let forecasts = body.forecasts;
                let weather = [];
                forecasts.forEach((forecast) => {
                    weather.push({
                        'day' : forecast.day? forecast.day.phrase_32char : undefined,
                        'night' : forecast.night? forecast.night.phrase_32char : undefined
                    });
                });

                console.log(weather);
            }
        })

        //get recent activites
        context.endDate = new moment().format("YYYY-MM-DD");
        context.startDate = new moment().add(-1, 'month').format("YYYY-MM-DD");

        calendar.listEvents(context).then(events => {
            events.forEach(event => {
                console.log(event.summary)
            });
        });

        context.recommend_result = recommendations[Math.floor(Math.random() * recommendations.length)];
        resolved(context);
    });
}

module.exports = {
    'recommend': recommend
};