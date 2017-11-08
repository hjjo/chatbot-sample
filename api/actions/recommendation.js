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
const nluService = require('watson-developer-cloud/natural-language-understanding/v1.js');
const credentials = require('../../util/service_credentials');

let nlu = new nluService({
  username: credentials.nlu.username,
  password: credentials.nlu.password,
  version_date: nluService.VERSION_DATE_2017_02_27
});

let getWeatherData = () => {
    let reqOption = {
        method : 'GET',
        url : credentials.twc.url + '/api/weather/v1/geocode/37/127/forecast/daily/3day.json',
        headers : {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    return new Promise((resolved, rejected) => {
        if(credentials.twc.url){
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

                    resolved(weather)
                }
                else{
                    resolved([])
                }
            })
        }
        else{
            resolved([])
        }
    })
}

let getMonthlyActivities = (context) => {
    return new Promise((resolved, rejected) => {
        //get recent activites
        let activities = "";

        context.data.endDate = new moment().format("YYYY-MM-DD");
        context.data.startDate = new moment().add(-1, 'month').format("YYYY-MM-DD");

        calendar.listEvents(context).then(result => {
            result.data.list_events_result.forEach(event => {
                console.log(event.summary)
                activities += event.summary + ".  "
            });

            if(activities.length > 10){
                nlu.analyze({
                    'text': activities, // Buffer or String
                    'features': {
                        'categories': {}
                    }
                }, function(err, response) {
                    if (err){
                        console.log('error:', err);
                        resolved([]);
                    }
                    else{
                        //console.log(JSON.stringify(response, null, 2));
                        resolved(response.categories);
                    }
                });
            }
            else{
                resolved([]);
            }
            
        });
    });
}

let recommend = (context) => {
    context.need_conversation = true;
    context.command = undefined;

    var recommendations = Object.assign({}, require('../../recommendation.json').recommendations);    

    return new Promise((resolved, rejected) => {

        let promises = [getWeatherData(), getMonthlyActivities(context)]

        Promise.all(promises).then(data => {
            let weather = data[0];

            let recentActivities = data[1];

            //get date
            let day = new moment().utcOffset('+0900').day()
            let isHoliday = false;
            if(day == 0 || day == 6){
                isHoliday = true;
            }

            /**
             * Recommendation example
             * {
             *       "subject": "공연",
             *       "affectedBy": {
             *           "weather": false,
             *           "dayOfWeek": false
             *       },
             *       "duration": 4
             *   },
             */
            let remained_recommendations = [];

            Object.keys(recommendations).forEach((index) => {
                let recommendation = recommendations[index];
                
                recommendation.availability = true;
                if(recommendation.affectedBy.weather && weather.length > 0){
                    let curruntWeather = weather[0].day ? weather[0].day : weather[0].night
                    if(curruntWeather.toLowerCase().indexOf('rain') >= 0){
                        recommendation.availability = false;
                        console.log(recommendation.subject, "weather problem")
                    }
                }
                if(recommendation.affectedBy.dayOfWeek && (isHoliday == false)){
                    recommendation.availability = false;
                    console.log(recommendation.subject, "weekend activity")
                }
                if(recentActivities){
                    recentActivities.forEach(activity => {
                        recommendation.categories.forEach(cat => {
                            if(activity.label.indexOf(cat)){
                                recommendation.availability = false;
                                console.log(recommendation.subject, "recently done")
                            }
                        })
                    });
                }
                if(recommendation.availability){
                    remained_recommendations.push(recommendation);
                }
            });
            context.data.rec_result = remained_recommendations[Math.floor(Math.random() * remained_recommendations.length)];
            resolved(context);
        });      
    });
}

module.exports = {
    'recommend': recommend
};