# Movement data Visual analytics application

## Overview

This application takes the developer through the process of building a web-application using
angular. 


## Prerequisites

### Git

- A good place to learn about setting up git is [here][git-github].
- Git [home][git-home] (download, documentation).

### Node.js and Tools

- Get [Node.js][node-download].
- Install the tool dependencies (`npm install`).


## Workings of the application

- The application filesystem layout structure is based on the [angular-seed] project.
- There is no dynamic backend (no application server) for this application. Instead we fake the
  application server by fetching static json files.
- Read the Development section at the end to familiarize yourself with running and developing
  an angular application.

### Installing dependencies

The application relies upon various node.js tools, such as Bower, Karma and Protractor.  You can
install these by running:

```
npm install
```

This will also run bower, which will download the angular files needed for the current step of the
tutorial.

Most of the scripts described below will run this automatically but it doesn't do any harm to run
it whenever you like.

### Running the app during development

- Run `npm start` or double click "start.bat"
- navigate your browser to `http://localhost:3000` to see the app running in your browser.

### Running unit tests

We recommend using [Jasmine][jasmine] and [Karma][karma] for your unit tests/specs, but you are free
to use whatever works for you.

- Start Karma with `npm test`
  - A browser will start and connect to the Karma server. Chrome is the default browser, others can
  be captured by loading the same url as the one in Chrome or by changing the `test/karma.conf.js`
  file.
- Karma will sit and watch your application and test JavaScript files. To run or re-run tests just
  change any of your these files.


### End to end testing

We recommend using [Jasmine][jasmine] and [Protractor][protractor] for end-to-end testing.

Requires a webserver that serves the application. See Running the app during development, above.

- Serve the application: run `npm start`.
- In a separate console run the end2end tests: `npm run protractor`. Protractor will execute the
  end2end test scripts against the web application itself.
  - The configuration is set up to run the tests on Chrome directly. If you want to run against
    other browsers then you must install the webDriver, `npm run update-webdriver`, and modify the
  configuration at `test/protractor-conf.js`.

## Application Directory Layout

    app/                --> all of the files to be used in production
      css/              --> css files
        app.css         --> default stylesheet
      img/              --> image files
      index.html        --> app layout file (the main html template file of the app)
      js/               --> javascript files
        app.js          --> the main application module
        controllers.js  --> application controllers
        directives.js   --> application directives
        filters.js      --> custom angular filters
        services.js     --> custom angular services
        animations.js   --> hooks for running JQuery animations with ngAnimate
        partials/         --> angular view partials (partial html templates) used by ngRoute
        partial1.html
        partial2.html
      lib  --> 3rd party js libraries, including angular and jquery
      mbar  --> some temp data files
      template  --> template html file for directive 


## Contact

For more information on AngularJS please check out http://angularjs.org/

You can send message to me for more information about this framework.

