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

var credentials = {
    'cloudant': {
        'url': ''
    },
    'conversation': {
        'username': '',
        'password': '',
        'workspace_id': '',
        "url" : "https://gateway.watsonplatform.net/conversation/api",
    	"version_date" : "2016-10-21",
    	"version" : "v1"
    },
    'nlu': {
        'username': '',
        'password': ''
    },
    'twc': {
        'url': ''
    }
};


//cloudant
credentials.cloudant.url = process.env.CLOUDANT_URL;

//conversation
credentials.conversation.username = process.env.CONVERSATION_USERNAME;
credentials.conversation.password = process.env.CONVERSATION_PASSWORD;
credentials.conversation.workspace_id = process.env.WORKSPACE_ID;

//nlu
credentials.nlu.username = process.env.NLU_USERNAME;
credentials.nlu.password = process.env.NLU_PASSWORD;

//twc
credentials.twc.url = process.env.TWC_URL;

if(process.env.VCAP_SERVICES){
    let services = JSON.parse(process.env.VCAP_SERVICES);

    //cloudant
    if(services.cloudantNoSQLDB){
        credentials.cloudant.url = services.cloudantNoSQLDB[0].credentials.url;
    }
    
    //conversation
    if(services.conversation){
        let wcs = services.conversation[0].credentials;
        credentials.conversation.username = wcs.username;
        credentials.conversation.password = wcs.password;
        credentials.conversation.workspace_id = process.env.WORKSPACE_ID;
    }
    //nlu
    if(services["natural-language-understanding"]){
        let nlu = services["natural-language-understanding"][0].credentials;
        credentials.nlu.username = nlu.username;
        credentials.nlu.password = nlu.password;
    }
    //twc
    if(services.weatherinsights){
        credentials.twc.url = services.weatherinsights[0].credentials.url;
    }
}

module.exports = credentials;