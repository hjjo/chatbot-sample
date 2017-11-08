#!/bin/bash

##
# Copyright IBM Corporation 2017
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
##

set -e

echo "Creating services..."
bx service create conversation free "conversation-service"
bx service create natural-language-understanding free "natural-language-understanding-service"
# bx service create weatherinsights Free-v2 "weather-service"
bx service create cloudantNoSQLDB Lite "cloudant-service"

bx service key-create conversation-service cred1
bx service key-create natural-language-understanding-service cred1
# bx service key-create weather-service cred1
bx service key-create cloudant-service cred1
echo "Services created."

# bx service key-delete -f "cloudant-service2" cred1
# bx service delete -f "cloudant-service2"
