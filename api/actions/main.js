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

const calendar = require('./calendar.js');
const recommendation = require('./recommendation.js');

let doAction = (context) => {
    switch(context.command){
        case "auth":
            return calendar.authorize(context);
        case "get_token":
            return calendar.getToken(context);
        case "list_events":
            return calendar.listEvents(context);
        case "add_event":
            return calendar.addEvent(context);
        case "recommend":
            return recommendation.recommend(context);
        case "finish":
            context.startDate = undefined;
            context.endDate = undefined;
            context.startTime = undefined;
            context.endTime = undefined;
            context.place = undefined;
            context.people = undefined;
            context.action = undefined;
            context.data = {};
            context.command = undefined;
            return context;
    }
}

module.exports = {
    'doAction': doAction
};