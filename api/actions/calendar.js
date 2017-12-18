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

const google = require('googleapis');
const googleAuth = require('google-auth-library');
const tinyurl = require('tinyurl');
var googleCred;
const cloudant = require('../../util/db');
const db = cloudant.db['context'];
const moment = require('moment-timezone');

try{
    googleCred = require('../../client_secret.json');
}
catch (ex) {
    //Do nothing.
}

if(!googleCred){
    googleCred = {
        'installed' : {
            'client_id' : process.env.GOOGLE_CLIENT_ID,
            'client_secret' : process.env.GOOGLE_CLIENT_SECRET,
            'redirect_uris' : [process.env.GOOGLE_REDIRECT_URI]
        }
    }
}

var auth = new googleAuth();
var SCOPES = ['https://www.googleapis.com/auth/calendar'];
var oauth2Client = new auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0]);

let authorize = (context) => {
    context.need_google_authorization = false;
    context.need_conversation = true;
    context.command = undefined;

    return new Promise((resolved, rejected) => {
        let authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });

        console.log(authUrl);

        tinyurl.shorten(authUrl, function(res) {
            context.data ? context.data : {};
            context.data.auth_url = res;
            resolved(context);
        });
    });
}

let getToken = (context) => {
    let code = context.data.auth_code;
    context.need_conversation = true;
    context.command = undefined;

    return new Promise((resolved, rejected) => {
        oauth2Client.getToken(code, function(err, token) {
            if(err){
                context.data = {};
                context.data.status = "error";
            }
            else{
                context.data = {};
                context.google_token = token;
            }
            resolved(context);
        });
    });
    
}

let listEvents = (context) => {
    context.need_conversation = true;
    context.command = undefined;

    return new Promise((resolved, rejected) => {
        if(context.google_token){
            var calendar = google.calendar('v3');
            oauth2Client.credentials = context.google_token;

            console.log(context.startDate, context.endDate);
            if(!context.startDate){
                context.startDate = moment().format("YYYY-MM-DD");
            }

            let startDate = moment(context.startDate + 'T00:00:00+0900');
            let endDate =  context.endDate ? moment(context.endDate + 'T00:00:00+0900') : moment(context.startDate + 'T00:00:00+0900');
            context.endDate ? true : endDate.add(1, 'day');

            //console.log(startDate, endDate)

            calendar.events.list({
                auth: oauth2Client,
                calendarId: 'primary',
                timeMin: startDate.toISOString(),
                timeMax: endDate.toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime',
                timeZone: context.timezone
            }, function(err, response) {
                if(!err){
                    context.data = context.data ? context.data : {};
                    //console.log(response.items); //need to refine
                    context.data.list_events_result = response.items;
                    context.data.list_events_result_string = [];
                    if(response.items && response.items.length > 0){
                        response.items.forEach(event => {
                            //console.log(event.start)
                            //console.log(event.start.dateTime)
                            context.data.list_events_result_string.push(moment(event.start.dateTime).format('HH:mm') + " ~ " + moment(event.end.dateTime).format('HH:mm') + " : " + event.summary);
                        });
                    }
                    console.log(context.data.list_events_result_string)
                    resolved(context);
                }
                else{
                    context.need_google_authorization = true;
                    context.google_token = undefined;
                    resolved(context);
                }
            });
        }
        else{
            context.need_google_authorization = true;
            resolved(context);
        }
    });
}

let addEvent = (context) => {
    context.need_conversation = true;
    context.command = undefined;

    return new Promise((resolved, rejected) => {
        if(context.google_token){
            var calendar = google.calendar('v3');
            oauth2Client.credentials = context.google_token;

            let startDate = context.startDate;
            let endDate = context.endDate;
            let startTime = context.startTime ? context.startTime : '00:00:00';
            let endTime = context.endTime;

            let start = moment(startDate + 'T'+ startTime + '+0900');
            let end;
            
            if(endDate){
                if(endTime){
                    end = moment(endDate + 'T' + endTime + '+0900');
                }
                else{
                    end = moment(endDate + 'T' + startTime + '+0900');
                }
            }
            else{
                if(context.startTime){
                    end = moment(startDate + 'T' + startTime + '+0900');
                    end.add(2, 'hour')
                }
                else{
                    end = moment(startDate + 'T'+ startTime + '+0900');
                    end.add(1, 'day');
                }
            }
            
            console.log(start.toISOString(), end.toISOString())

            let summary = "";
            context.people? (summary += context.people + " ") : true;
            context.place? (summary += context.place  + " ") : true;
            context.action? (summary += context.action  + " ") : true;

            var event = {
                'summary': summary,
                //'location': '800 Howard St., San Francisco, CA 94103',
                //'description': 'A chance to hear more about Google\'s developer products.',
                'start': {
                    'dateTime': start.toISOString(),
                    'timeZone': context.timezone
                },
                'end': {
                    'dateTime': end.toISOString(),
                    'timeZone': context.timezone
                },
                // 'recurrence': [
                //     'RRULE:FREQ=DAILY;COUNT=1'
                // ],
                'reminders': {
                    'useDefault': true
                },
            };

            if(context.place){
                event.location = context.place;
            }

            calendar.events.insert({
                auth: oauth2Client,
                calendarId: 'primary',
                resource: event,
            }, function(err, event) {
                console.log(err, event)
                if (err) {
                    context.need_google_authorization = true;
                    context.google_token = undefined;
                    resolved(context);
                }
                else{
                    context.data = context.data?context.data:{};
                    console.log('Event created: %s', event.htmlLink);
                    context.data.add_event_result = event.htmlLink;
                    resolved(context);
                }
            });
        }
        else{
            context.need_google_authorization = true;
            resolved(context);
        }
    });
}

module.exports = {
    'authorize': authorize,
    'getToken' : getToken,
    'listEvents' : listEvents,
    'addEvent': addEvent
};