# IBM Watson을 활용한 AI 비서 - 캘린더봇

*Read this in other languages: [English](README-en.md).*

이 애플리케이션은 IBM Watson Conversation을 활용하고자 하는 개발자를 위해 개발되었습니다. 이 애플리케이션은 "오늘 뭐하지?" 라는 단순한 질문에 대한 아이디어에서 시작하였으며 IBM Watson Natural language Understanding 및 The Weather Company Data를 활용하여 사용자의 최근 액티비티, 날씨 정보 등을 기반으로 사용자에게 오늘 할 수 있는 활동을 추천합니다.

이 애플리케이션은 [Conversation Simple](conversation_simple)을 기반으로 수정하여 개발했으며 [데모 링크][demo_url]에서 테스트할 수 있습니다.

이 애플리케이션의 구성을 이해하고 튜토리얼을 마치면 다음을 이해할 수 있습니다.
* Node.js 기반의 챗봇 애플리케이션 개발
* IBM Watson Conversation을 활용하여 챗봇 빌드
* IBM Watson Natural Language Undersatanding 및 The Weather Company Data 서비스를 애플리케이션에서 활용
* 구글 캘린더 API 및 tinyurl의 Url Shorten 기능을 애플리케이션에서 사용

[Flow 아키텍쳐 그림 여기에]

## Flow
1.
1.
1.

## 포함된 구성 요소
* [IBM Watson Conversation](https://www.ibm.com/watson/developercloud/conversation.html): 자연어를 이해하고 기계 학습(Machine learning)을 사용하여 고객과 소통할 때 사람이 하는 대화 방식으로 응답하는 어플리케이션을 만들 수 있도록 모든 기능을 제공해주는 서비스 입니다.

* [IBM Watson Natural Language Understanding](https://www.ibm.com/watson/developercloud/natural-language-understanding.html): 텍스트를 분석하여 컨텐츠로부터 컨셉, 엔티티, 키워드, 카테고리, 긍부정, 감정, 관계 등과 같은 메타데이터를 추출하는데에 활용할 수 있는 서비스입니다.

* [The Weather Company Data]

## 사용된 기술
* [Node.js](https://nodejs.org/): An asynchronous event driven JavaScript runtime, designed to build scalable applications.

* [Google Calendar API](https://developers.google.com/google-apps/calendar/)

* [tinyurl]

# Steps

[IBM Cloud에 바로 배포](1-IBM-Cloud에-배포하기)하거나 [로컬에서 실행](2-로컬에서-실행하기)합니다.

## 사전 준비 사항

* IBM Cloud의 계정을 생성합니다.
    * IBM Cloud에서 [새로운 계정을 생성](https://console.bluemix.net/registration/)하거나 갖고 계신 계정을 사용하십시오. 계정에 512MB의 앱을 실행하고 5개 이상의 서비스를 생성할 수 있는 가용 공간이 있어야 합니다.
* 애플리케이션을 로컬에서 실행하려면 Node.js 런타임 및 npm 패키지 매니저를 설치합니다.:
    * [Node.js 런타임 및 npm 패키지 매니저 설치](https://nodejs.org/#download)
* 로컬에서 변경한 애플리케이션을 IBM Cloud에 배포하려면 CLI(Command Line Interface)를 설치합니다.
    * [IBM Cloud CLI 설치](http://clis.ng.bluemix.net/)
* 이 애플리케이션은 Google Calendar API를 사용합니다. 
    * [Google API 콘솔에서 프로젝트 생성](https://console.developers.google.com/flows/enableapi?apiid=calendar&authuser=0)
        - ``계속`` 버튼을 누른 후 ``사용자 인증 정보로 이동`` 버튼 클릭하면 ``사용자 인증 정보``페이지가 오픈됩니다. 이 화면에서 ``취소`` 버튼을 누릅니다.
        - 화면 상단의 ``OAuth 동의 화면``탭을 클릭합니다. ``사용자에게 표시되는 제품 이름``을 입력하고 저장합니다.
        - ``사용자 인증 정보``탭에서 ``사용자 인증 정보 만들기`` 버튼을 클릭하여 ``OAuth 클라이언트 ID``를 선택합니다.
        - 애플리케이션 유형으로 ``기타``를 선택하고 이름에 ``Tutorial``을 입력합니다. ``생성`` 버튼을 누릅니다.
        - 팝업에서 클라이언트 ID와 Password를 복사하여 기록해둡니다.
        - 팝업을 종료하고 ``JSON 다운로드`` 아이콘을 클릭하여 JSON을 다운로드 합니다. 이 파일을 client_secret.json으로 저장합니다.
* 카카오톡과 챗봇을 연동하려면 카카오톡 플러스친구를 생성하십시오.
    * [카카오톡 플러스 친구 생성](https://center-pf.kakao.com)
* 애플리케이션의 소스코드를 다운로드 합니다.
    * [소스코드 레파지토리](https://github.com/hjjo/chatbot-sample)에서 ``Clone or download`` 버튼을 통해 다운로드 하십시오. git 사용자의 경우 git client를 통해 clone하거나 folk합니다.

## 1. IBM Cloud에 배포하기
[이 링크를 클릭하여 애플리케이션을 IBM Cloud에 배포합니다.](https://bluemix.net/deploy?repository=https://github.com/hjjo/chatbot-sample.git)

### Conversation의 Workspace 설정

1. IBM Cloud의 [대시보드](https://console.bluemix.net/dashboard)에 접속합니다. 애플리케이션 배포시 설정했던 Region, Organization 및 Space를 올바르게 선택합니다.
1. 서비스 목록에서 conversation-service를 선택합니다.
1. ``Launch Tool`` 버튼을 눌러 **Conversation Tool**을 오픈합니다. 이 링크를 기억해 두십시오. 
1. Conversation Tool에서 ``Import a workspace`` 아이콘을 선택하십시오. 아래와 같이 생겼습니다.
    [아이콘 이미지 삽입]
1. 애플리케이션 소스코드의 /training/calendar_bot_workspace.json 파일을 선택합니다.
    `<project_root>/training/calendar_bot_workspace.json`
1. ``Everything (Intents, Entities, and Dialog)``를 선택하고 ``Import`` 버튼을 눌러 워크스페이스를 생성합니다.
1. 생성된 워크스페이스의 카드 우측 상단에 위치한 아이콘을 눌러 ``View Details``를 선택합니다.
1. ``Workspace ID``를 복사하여 기록해 둡니다.
1. IBM Cloud의 [대시보드](https://console.bluemix.net/dashboard)에서 애플리케이션을 선택합니다. ROUTE가 아닌 NAME 부분을 클릭하십시오.
1. 좌측 메뉴에서 ``Runtime``을 선택합니다.
1. ``Environment Variables`` 탭을 선택하고 스크롤을 아래로 내립니다. User Defind라고 명시된 환경변수 항목들이 보입니다. 이 항목들 중에서 WORKSPACE_ID의 VALUE 값을 위에서 복사해둔 값으로 변경합니다.

### 구글 캘린더 API 설정
애플리케이션 대시보드의 Runtime 페이지에 있는 ``Environment Variables`` 탭에서 계속 진행하십시오.
1. GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET의 VALUE 값을 사전 준비사항에서 기록해둔 값으로 변경합니다.

### 애플리케이션 재시작
애플리케이션 대시보드에서 변경한 환경 변수를 반영하기 위해 애플리케이션을 재시작 하십시오. 

### 애플리케이션 실행
``Visit App URL`` 버튼을 클릭하여 애플리케이션을 실행합니다.

## 2. 로컬에서 실행하기 (이번 실습 세션에서는 진행하지 않습니다.)

이 앱을 베이스로 하여 수정 및 새로운 앱을 개발하고자 하는 경우 로컬에 설치할 수 있습니다. 수정한 앱 버전을 다시 IBM Cloud로 배포할 수 있습니다.

## 3. Watson Conversation Tool 실습

위 단계에서 Import한 /training/calendar_bot_workspace.json 파일은 주요 기능을 직접 개발하도록 완전하지 않은 상태입니다. Import한 워크스페이스를 시작점으로 하여 캘린더 봇을 완성해 봅니다.

### 3.1 Intent 추가 

### 3.2 Entity 추가

### 3.3 Dialog 작성

## License

This sample code is licensed under Apache 2.0.
Full license text is available in [LICENSE](LICENSE).

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md).

## Open Source @ IBM

Find more open source projects on the
[IBM Github Page](http://ibm.github.io/).


[conversation_simple]: https://github.com/watson-developer-cloud/conversation-simple
[cf_docs]: (https://www.ibm.com/watson/developercloud/doc/common/getting-started-cf.html)
[cloud_foundry]: https://github.com/cloudfoundry/cli#downloads
[demo_url]: https://connectbot-2017.eu-gb.mybluemix.net/
[doc_intents]: (https://console.bluemix.net/docs/services/conversation/intents-entities.html#planning-your-entities)
[docs]: http://www.ibm.com/watson/developercloud/doc/conversation/overview.shtml
[docs_landing]: (https://console.bluemix.net/docs/services/conversation/index.html#about)
[node_link]: (http://nodejs.org/)
[npm_link]: (https://www.npmjs.com/)
[sign_up]: bluemix.net/registration