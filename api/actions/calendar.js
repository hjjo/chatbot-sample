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
const googleCred = require('../../client_secret.json');
const cloudant = require('../../util/db');
const db = cloudant.db['context'];
const moment = require('moment');

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
            context.auth_url = res;
            resolved(context);
        });
    });
}

let getToken = (context) => {
    let code = context.auth_code;
    context.need_conversation = true;
    context.command = undefined;

    return new Promise((resolved, rejected) => {
        oauth2Client.getToken(code, function(err, token) {
            if(err){
                context.status = "error";
            }
            else{
                context.google_token = token;
                context.auth_url = undefined;
                context.auth_code = undefined;
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
                context.startDate = new moment().format("YYYY-MM-DD");
            }

            let startDate = new moment(context.startDate + 'T00:00:00+0900');
            let endDate =  context.endDate ? new moment(context.endDate + 'T00:00:00+0900') : new moment(context.startDate + 'T00:00:00+0900');
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
                    //console.log(response.items); //need to refine
                    context.list_events_result = response.items;
                    context.list_events_result_string = [];
                    if(response.items && response.items.length > 0){
                        response.items.forEach(event => {
                            //console.log(event.start)
                            context.list_events_result_string.push(new moment(event.start.dateTime).format('hh:mm') + " ~ " + new moment(event.end.dateTime).format('hh:mm') + " : " + event.summary);
                        });
                    }
                    console.log(context.list_events_result_string)
                    resolved(context);
                }
                else{
                    context.need_google_authorization = true;
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

            let start = new moment(context.startDate + 'T'+ startTime + '+0900');
            let end;
            
            if(endDate){
                if(endTime){
                    end = new moment(context.endDate + 'T' + endTime + '+0900');
                }
                else{
                    end = new moment(context.endDate + 'T' + startTime + '+0900');
                    end.add(2, 'hour')
                }
            }
            else{
                end = new moment(context.startDate + 'T'+ startTime + '+0900');
                end.add(1, 'day');
            }

            var event = {
                'summary': context.data.name,
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

            calendar.events.insert({
                auth: oauth2Client,
                calendarId: 'primary',
                resource: event,
            }, function(err, event) {
                console.log(err, event)
                if (err) {
                    context.need_google_authorization = true;
                    resolved(context);
                }
                else{
                    console.log('Event created: %s', event.htmlLink);
                    context.add_event_result = event.htmlLink;
                    resolved(context);
                }
            });
        }
    });
}

module.exports = {
    'authorize': authorize,
    'getToken' : getToken,
    'listEvents' : listEvents,
    'addEvent': addEvent
};