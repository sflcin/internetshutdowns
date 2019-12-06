## Internet Shutdowns Tracker
An interactive map of India showing instances of Internet shutdowns by state governments.

### Why do we need to track Internet Shutdowns?

TODO:
* Document the working of current website
* comment all code used and clean as much as possible
* Sync up the hosting
* Add the blog section in the menu, redirecting to "blog.internetshutdowns.in"
* Update Longest shutdown section with the latest content
* States update in the json
* Update all the depreciated packages to the latest ones (bower -> yarn, jade -> pug)
* Adding tests for the deployment (make sure you check the tests before deploying)


## To setup the project locally:
The project uses stack including Node, Bower, Express and MongoDB. Follow the steps to setup the project locally:
* Install the nodejs and git
* Install node dependencies using `npm install` which will install bower dependencies itself.
* To run the server locally, `npm run start`


### To add new shutdowns

### To update different part of the website

## Structure
The project uses MVC architecture, views are under views directory, model (in separate repository, shutdowns-backend), controller. Development stack includes Node, Express and MongoDB.

## Dependencies
#### Package.json
* "body-parser": "^1.15.2"
* "bower": "^1.8.0"
* "compression": "^1.6.2"
* "cookie-parser": "^1.4.3"
* "express": "^4.14.0"
* "grunt": "^0.4.5"
* "grunt-browser-sync": "^2.2.0"
* "grunt-contrib-watch": "^1.0.0"
* "helmet": "^3.6.0"
* "jade": "^1.11.0"
* "less-middleware": "^2.2.0"
* "load-grunt-tasks": "^3.3.0"
* "morgan": "^1.7.0"
* "nodemailer": "^0.7.1"
* "turf-centroid": "^3.0.12"
* "watchify": "^3.7.0"

#### Bower.json
* "jquery": "~2.1.1",
* "lodash": "~4.11.1",
* "bootstrap": "~3.3.7",
* "bootstrap-offcanvas": "~2.4.0",
* "leaflet": "~0.7.7",
* "fontawesome": "~4.6.3",
* "chroma-js": "~1.1.1",
* "moment": "~2.13.0",
* "ractive": "^0.8.7"

## Contribute
Internet shutdowns frontend is open source and welcomes all types of contributions. The current task to be done can be found at TODO section above. Make sure you read contributing guidelines to know more about hte contribution workflow and guidelines.

## License
The project is under Open Database license (ODbL).
